import Docxtemplater from "docxtemplater/js/docxtemplater.js";
import PizZip from "pizzip";
import ImageModule from "docxtemplater-image-module-free";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");
const BLANK_IMAGE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const getDaysDiff = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate - startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getWorkerCount = (names) => {
  if (!names) return 0;
  if (Array.isArray(names)) return names.length;
  return names.split(/[,，\s]+/).filter((n) => n.trim().length > 0).length;
};

const wrapText = (text, limit = 50) => {
  if (!text) return "";
  try {
    const segmenter = new Intl.Segmenter("th", { granularity: "word" });
    return text
      .split("\n")
      .map((line) => {
        const segments = segmenter.segment(line);
        let currentLine = "";
        let wrappedLine = "";
        for (const { segment } of segments) {
          if ((currentLine + segment).length > limit) {
            if (currentLine.length > 0) {
              wrappedLine += currentLine + "\n";
              currentLine = segment;
            } else {
              for (let i = 0; i < segment.length; i += limit) {
                wrappedLine += segment.substring(i, i + limit) + "\n";
              }
              currentLine = "";
            }
          } else {
            currentLine += segment;
          }
        }
        return (wrappedLine + currentLine).trim();
      })
      .join("\n");
  } catch (e) {
    return text
      .split("\n")
      .map((line) => {
        let wrappedLine = "";
        for (let i = 0; i < line.length; i += limit) {
          wrappedLine +=
            line.substring(i, i + limit) +
            (i + limit < line.length ? "\n" : "");
        }
        return wrappedLine;
      })
      .join("\n");
  }
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const getR2ProxyUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith(".r2.dev")) return null;

    const fileKey = parsedUrl.pathname.split("/").filter(Boolean).pop();
    if (!fileKey) return null;

    return `${API_BASE_URL}/r2-files/${encodeURIComponent(fileKey)}`;
  } catch (e) {
    return null;
  }
};

const fetchImageAsDataUrl = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image fetch failed with status ${res.status}`);
  }
  return blobToDataUrl(await res.blob());
};

const isDataUrl = (value) =>
  typeof value === "string" && value.startsWith("data:");

const isFetchableUrl = (value) =>
  typeof value === "string" && (value.startsWith("blob:") || /^https?:\/\//i.test(value));

const resolveRemoteImage = async (url) => {
  if (!url) return null;
  if (isDataUrl(url)) return url;
  if (!isFetchableUrl(url)) return null;

  try {
    return await fetchImageAsDataUrl(url);
  } catch (err) {
    if (url.startsWith("blob:")) {
      throw err;
    }
    const proxyUrl = getR2ProxyUrl(url);
    if (!proxyUrl) {
      throw err;
    }

    try {
      return await fetchImageAsDataUrl(proxyUrl);
    } catch (proxyErr) {
      throw proxyErr;
    }
  }
};

const resolveImageSource = async (source, label = "image") => {
  if (!source) return null;

  if (typeof source === "string") {
    try {
      return await resolveRemoteImage(source);
    } catch (err) {
      console.warn(`Failed to resolve ${label}; using fallback image.`);
      return null;
    }
  }

  const primarySource =
    source?.data || source?.uploadedUrl || source?.url || source?.fallbackData || null;
  const fallbackSource =
    source?.fallbackData || source?.data || source?.uploadedUrl || source?.url || null;

  try {
    const resolved = await resolveRemoteImage(primarySource);
    if (resolved) {
      return resolved;
    }
  } catch (err) {
    if (isDataUrl(primarySource)) {
      return primarySource;
    }
    console.warn(`Failed to resolve ${label}; using fallback image.`);
  }

  if (fallbackSource && fallbackSource !== primarySource) {
    if (isDataUrl(fallbackSource)) {
      return fallbackSource;
    }

    try {
      return await resolveRemoteImage(fallbackSource);
    } catch (fallbackErr) {
      console.warn(`Failed to resolve fallback ${label}; using blank placeholder.`);
    }
  }

  console.warn(`Using blank placeholder for missing ${label}.`);
  return BLANK_IMAGE_DATA_URL;
};

// Robust Base64 Parser from official Docxtemplater Image Module guidelines
const base64Regex = /^(?:data:)?image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;
const validBase64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const base64Parser = (tagValue) => {
  if (typeof tagValue !== "string" || !base64Regex.test(tagValue)) {
    return false;
  }
  const stringBase64 = tagValue.replace(base64Regex, "");
  if (!validBase64.test(stringBase64)) {
    throw new Error(
      "Error parsing base64 data, your data contains invalid characters"
    );
  }
  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const generateDocxBlob = async (formData, plans, jobEntries) => {
  // Pre-resolve all photo URLs to base64
  const resolvedPhotos = await Promise.all(
    formData.photos.map(async (p) => {
      const base64 = await resolveImageSource(p, `photo ${p.name || ""}`.trim());
      return { ...p, data: base64 || BLANK_IMAGE_DATA_URL };
    })
  );

  // Pre-resolve reportedBySig to base64
  const resolvedReportedBySig =
    (await resolveImageSource(formData.reportedBySig, "reportedBySig")) ||
    BLANK_IMAGE_DATA_URL;

  const resolvedCompanyLogo =
    (await resolveImageSource(
      formData.companyLogo?.preview || formData.CL,
      "companyLogo"
    )) || BLANK_IMAGE_DATA_URL;

  const response = await fetch("/template_v15.docx");
  if (!response.ok) throw new Error("Template not found");
  const arrayBuffer = await response.arrayBuffer();
  const zip = new (PizZip.default || PizZip)(arrayBuffer);

  // Image Module Configuration
  const opts = {
    centered: false,
    getImage: (tagValue) => {
      if (!tagValue) return null;
      console.log("Rendering image:", tagValue.substring(0, 30));
      const parsed = base64Parser(tagValue);
      if (parsed) return parsed;

      // Fallback parsing if data prefix is missing or different
      try {
        const base64 = tagValue.includes(",") ? tagValue.split(",")[1] : tagValue;
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      } catch (e) {
        console.error("Failed to parse image base64:", e);
        return null;
      }
    },
    getSize: (img, tagValue, tagName) => {
      if (tagName === "reportedBySig") {
        return [150, 50]; // Custom signature size in pixels (fits perfect in table)
      }
      if (tagName === "CL") {
        return [60, 57];
      }

      return [297, 221]; // Standard photo size in pixels
    },
    fileType: "docx",
  };
  const imageModule = new ImageModule(opts);

  const doc = new (Docxtemplater.default || Docxtemplater)(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [imageModule],
  });

  const flatItems = [];
  plans.forEach((p) => {
    flatItems.push({
      name: wrapText(p.locationName, 50),
      startDate: p.startDate,
      endDate: p.endDate,
      daysWorked: getDaysDiff(p.startDate, formData.workDate),
      daysRemaining: getDaysDiff(formData.workDate, p.endDate),
      isLocation: true,
    });
    p.tasks.forEach((t) => {
      flatItems.push({
        name: `    ${wrapText(t.name, 45)}`,
        startDate: t.startDate,
        endDate: t.endDate,
        daysWorked: getDaysDiff(t.startDate, formData.workDate),
        daysRemaining: getDaysDiff(formData.workDate, t.endDate),
        isLocation: false,
      });
    });
  });

  doc.render({
    ...formData,
    projectName: wrapText(formData.projectName, 60),
    remarks: wrapText(formData.remarks, 80),
    workersRemarks: wrapText(formData.workersRemarks, 80),
    obstacles: wrapText(formData.obstacles, 80),
    w1: formData.weather === "ปลอดโปร่ง" ? "☑" : "☐",
    w2: formData.weather === "ฝนตก" ? "☑" : "☐",
    w3: formData.weather === "มีเมฆมาก" ? "☑" : "☐",
    w4: formData.weather === "แดดร้อน" ? "☑" : "☐",
    // Counts for simple tags like {workersForeman}
    workersForeman: getWorkerCount(formData.workersForeman),
    workersElectrician: getWorkerCount(formData.workersElectrician),
    workersIT: getWorkerCount(formData.workersIT),
    workersMason: getWorkerCount(formData.workersMason),
    workersWelder: getWorkerCount(formData.workersWelder),
    workersPlumber: getWorkerCount(formData.workersPlumber),
    workersOthers: getWorkerCount(formData.workersOthers),

    // Split worker lists into 'First' and 'Others' for each category
    // This allows us to use two different row designs in Word to achieve perfect vertical merging.
    ...(() => {
      const categories = [
        { key: "workersForeman", tag: "workerForeman", label: "ผู้จัดการ / ผู้ควบคุมงาน / โฟร์แมน" },
        { key: "workersElectrician", tag: "workerElectricain", label: "ช่างไฟฟ้า / อิเล็กทรอนิกส์" },
        { key: "workersIT", tag: "workerIT", label: "ช่างระบบสื่อสาร / ไอที" },
        { key: "workersMason", tag: "workerMason", label: "ช่างปูน / ฉาบ / ก่ออิฐ" },
        { key: "workersWelder", tag: "workerWelder", label: "ช่างเหล็ก / ช่างเชื่อม" },
        { key: "workersPlumber", tag: "workerPlumber", label: "ช่างงานสุขาภิบาล / งานปะปา" },
        { key: "workersOthers", tag: "workerOther", label: "งานอื่นๆ" },
      ];

      const result = {};
      categories.forEach((cat) => {
        const list = formData[cat.key] || [];
        result[`${cat.tag}First`] = list.slice(0, 1).map((n) => ({
          name: n,
          label: cat.label,
          count: getWorkerCount(list),
        }));
        result[`${cat.tag}Others`] = list.slice(1).map((n) => ({
          name: n,
        }));
      });
      return result;
    })(),

    total: Object.keys(formData)
      .filter((k) => k.startsWith("workers") && Array.isArray(formData[k]))
      .reduce((sum, key) => sum + getWorkerCount(formData[key]), 0),
    workerRemark: formData.workersRemarks,
    workerRemarkWrapped: wrapText(formData.workersRemarks, 30),
    wc1:
      Object.keys(formData)
        .filter((k) => k.startsWith("workers") && Array.isArray(formData[k]))
        .reduce((sum, key) => sum + getWorkerCount(formData[key]), 0) >= 13
        ? "☑"
        : "☐",
    wc2:
      Object.keys(formData)
        .filter((k) => k.startsWith("workers") && Array.isArray(formData[k]))
        .reduce((sum, key) => sum + getWorkerCount(formData[key]), 0) < 13
        ? "☑"
        : "☐",
    items: flatItems,
    jobs: jobEntries.map((j, index) => ({
      no: index + 1,
      detail: wrapText(j.detail, 40),
      result: wrapText(j.result, 40),
      location: wrapText(j.location, 20),
      executor: wrapText(j.executor, 20),
    })),
    // Photo pairs for 2-column table
    photoRows: (() => {
      const rows = [];
      for (let i = 0; i < resolvedPhotos.length; i += 2) {
        rows.push({
          photo1: resolvedPhotos[i].data,
          photo2: resolvedPhotos[i + 1] ? resolvedPhotos[i + 1].data : BLANK_IMAGE_DATA_URL,
          hasPhoto2: !!resolvedPhotos[i + 1],
        });
      }
      return rows;
    })(),

    A0: resolvedPhotos.length == 0 && !formData.hasAttachment ? "☑" : "☐",
    A2: resolvedPhotos.length > 0 ? "☑" : "☐",
    hasAttachment: formData.hasAttachment ? "☑" : "☐",
    noAttachment: !formData.hasAttachment ? "☑" : "☐",
    reportedBySig:
      resolvedReportedBySig ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",

    CL: resolvedCompanyLogo ||
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  });

  return doc.getZip().generate({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
};
