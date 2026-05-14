import type {
  CalendarWidgetElement,
  CanvasData,
  CanvasElement,
  CountdownWidgetElement,
  GiftWidgetElement,
  ImageElement,
  MapWidgetElement,
  TextElement,
  VideoWidgetElement,
} from "@/types/editor";

type VariableValue = string | number | boolean | Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveVariableValue(
  element: CanvasElement,
  variableValues: Record<string, VariableValue>,
) {
  const key = element.templateVariable?.enabled
    ? element.templateVariable.key?.trim()
    : "";

  if (!key) return undefined;
  return variableValues[key];
}

function applyTextVariables(
  element: TextElement,
  variableValues: Record<string, VariableValue>,
): TextElement {
  const directValue = resolveVariableValue(element, variableValues);
  if (
    typeof directValue === "string" ||
    typeof directValue === "number" ||
    typeof directValue === "boolean"
  ) {
    return { ...element, content: String(directValue) };
  }

  return {
    ...element,
    content: element.content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const value = variableValues[key.trim()];
      return value !== undefined ? String(value) : `{{${key}}}`;
    }),
  };
}

function applyImageVariables(
  element: ImageElement,
  variableValues: Record<string, VariableValue>,
): ImageElement {
  const directValue = resolveVariableValue(element, variableValues);

  if (typeof directValue === "string") {
    return { ...element, url: directValue };
  }

  if (isRecord(directValue) && typeof directValue.url === "string") {
    return { ...element, url: directValue.url };
  }

  return element;
}

function applyCalendarVariables(
  element: CalendarWidgetElement,
  variableValues: Record<string, VariableValue>,
): CalendarWidgetElement {
  const directValue = resolveVariableValue(element, variableValues);
  if (typeof directValue !== "string") return element;

  const parsed = new Date(directValue);
  if (Number.isNaN(parsed.getTime())) return element;

  return {
    ...element,
    config: {
      ...element.config,
      fullDate: directValue,
      selectedDay: parsed.getDate(),
      month: parsed.getMonth() + 1,
      year: parsed.getFullYear(),
    },
  };
}

function applyCountdownVariables(
  element: CountdownWidgetElement,
  variableValues: Record<string, VariableValue>,
): CountdownWidgetElement {
  const directValue = resolveVariableValue(element, variableValues);
  if (typeof directValue !== "string") return element;

  return {
    ...element,
    config: {
      ...element.config,
      targetDate: directValue,
    },
  };
}

function applyMapVariables(
  element: MapWidgetElement,
  variableValues: Record<string, VariableValue>,
): MapWidgetElement {
  const directValue = resolveVariableValue(element, variableValues);

  if (typeof directValue === "string") {
    return {
      ...element,
      config: {
        ...element.config,
        address: directValue,
      },
    };
  }

  if (isRecord(directValue)) {
    return {
      ...element,
      config: {
        ...element.config,
        ...(typeof directValue.address === "string"
          ? { address: directValue.address }
          : {}),
        ...(typeof directValue.lat === "string" ||
        typeof directValue.lat === "number"
          ? { lat: directValue.lat }
          : {}),
        ...(typeof directValue.lng === "string" ||
        typeof directValue.lng === "number"
          ? { lng: directValue.lng }
          : {}),
      },
    };
  }

  return element;
}

function applyVideoVariables(
  element: VideoWidgetElement,
  variableValues: Record<string, VariableValue>,
): VideoWidgetElement {
  const directValue = resolveVariableValue(element, variableValues);
  if (typeof directValue !== "string") return element;

  return {
    ...element,
    config: {
      ...element.config,
      videoUrl: directValue,
    },
  };
}

function applyGiftVariables(
  element: GiftWidgetElement,
  variableValues: Record<string, VariableValue>,
): GiftWidgetElement {
  const directValue = resolveVariableValue(element, variableValues);
  if (!isRecord(directValue)) return element;

  return {
    ...element,
    config: {
      ...element.config,
      ...directValue,
    },
  };
}

function applyElementVariables(
  element: CanvasElement,
  variableValues: Record<string, VariableValue>,
): CanvasElement {
  if (element.type === "text") {
    return applyTextVariables(element, variableValues);
  }

  if (element.type === "image") {
    return applyImageVariables(element, variableValues);
  }

  if (element.type !== "widget") return element;

  switch (element.widgetType) {
    case "calendar":
      return applyCalendarVariables(element, variableValues);
    case "countdown":
      return applyCountdownVariables(element, variableValues);
    case "map":
      return applyMapVariables(element, variableValues);
    case "video":
      return applyVideoVariables(element, variableValues);
    case "qr_gift":
      return applyGiftVariables(element, variableValues);
    default:
      return element;
  }
}

export function applyInvitationVariablesToElements(
  elements: CanvasElement[],
  variableValues: Record<string, VariableValue>,
) {
  return elements.map((element) => applyElementVariables(element, variableValues));
}

export function applyInvitationVariablesToCanvasData(
  canvasData: CanvasData,
  variableValues: Record<string, VariableValue>,
): CanvasData {
  return {
    ...canvasData,
    elements: applyInvitationVariablesToElements(
      canvasData.elements || [],
      variableValues,
    ),
  };
}
