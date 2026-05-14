import type { VariableType } from '../../../entities/template-variable.entity';

type ExtractedTemplateVariable = {
  key: string;
  label: string;
  type: VariableType;
  required: boolean;
  defaultValue: string | null;
  placeholder: string | null;
  sortOrder: number;
};

type UnknownRecord = Record<string, unknown>;

export class TemplateVariableExtractionError extends Error {}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function humanizeKey(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveVariableType(element: UnknownRecord): VariableType {
  if (element.type === 'text') return 'text';
  if (element.type === 'image') return 'image';
  if (element.type !== 'widget') return 'text';

  switch (element.widgetType) {
    case 'calendar':
      return 'date';
    case 'countdown':
      return 'datetime';
    case 'map':
      return 'address';
    case 'video':
      return 'url';
    case 'qr_gift':
      return 'json';
    default:
      return 'text';
  }
}

function resolveDefaultValue(element: UnknownRecord): string | null {
  if (element.type === 'text') {
    return readString(element.content);
  }

  if (element.type === 'image') {
    return readString(element.url);
  }

  if (element.type !== 'widget' || !isRecord(element.config)) {
    return null;
  }

  switch (element.widgetType) {
    case 'calendar':
      return readString(element.config.fullDate);
    case 'countdown':
      return readString(element.config.targetDate);
    case 'map':
      return readString(element.config.address);
    case 'video':
      return readString(element.config.videoUrl);
    default:
      return null;
  }
}

export function extractTemplateVariables(
  canvasData: Record<string, unknown>,
): ExtractedTemplateVariable[] {
  const elements = canvasData.elements;
  if (!Array.isArray(elements)) return [];

  const extracted: ExtractedTemplateVariable[] = [];
  const usedKeys = new Map<string, number>();

  elements.forEach((rawElement, index) => {
    if (!isRecord(rawElement) || !isRecord(rawElement.templateVariable)) return;

    const templateVariable = rawElement.templateVariable;
    if (templateVariable.enabled !== true) return;

    const rawKey = readString(templateVariable.key);
    if (!rawKey) {
      throw new TemplateVariableExtractionError(
        `Variable ở phần tử thứ ${index + 1} đang bật nhưng chưa có key`,
      );
    }

    const normalizedKey = normalizeKey(rawKey);
    if (!normalizedKey) {
      throw new TemplateVariableExtractionError(
        `Variable '${rawKey}' không hợp lệ sau khi chuẩn hóa key`,
      );
    }

    if (usedKeys.has(normalizedKey)) {
      throw new TemplateVariableExtractionError(
        `Variable key bị trùng: '${normalizedKey}'`,
      );
    }

    usedKeys.set(normalizedKey, index);

    extracted.push({
      key: normalizedKey,
      label: readString(templateVariable.label) || humanizeKey(normalizedKey),
      type: resolveVariableType(rawElement),
      required: Boolean(templateVariable.required),
      defaultValue: resolveDefaultValue(rawElement),
      placeholder: readString(templateVariable.description),
      sortOrder: extracted.length,
    });
  });

  return extracted;
}
