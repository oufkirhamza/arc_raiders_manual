/** Contribution requests: shared types, labels and validation (safe to import anywhere). */

export const REQUEST_KINDS = {
  new_item: "Add a missing item",
  correction: "Correct an existing item",
  report: "Report a problem",
} as const;
export type RequestKind = keyof typeof REQUEST_KINDS;

export const REQUEST_STATUSES = {
  new: "New",
  in_review: "In review",
  accepted: "Accepted",
  done: "Done",
  rejected: "Rejected",
} as const;
export type RequestStatus = keyof typeof REQUEST_STATUSES;

export const CORRECTION_FIELDS = [
  "Name", "Description", "Rarity", "Type", "Sell value", "Weight", "Stack size",
  "Crafting recipe", "Recycles into", "Salvages into", "Where to find", "Used for (quests / upgrades)",
  "Image", "Other",
] as const;

export interface ContributionRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  kind: RequestKind;
  status: RequestStatus;
  /** dataset item id when the request concerns an existing item */
  itemId?: string;
  /** proposed name for a new item */
  itemName?: string;
  field?: string;
  currentValue?: string;
  proposedValue?: string;
  details: string;
  sourceUrl?: string;
  contact?: string;
  /** admin-only */
  adminNotes?: string;
  history: { at: string; status: RequestStatus; note?: string }[];
}

export type NewRequestInput = Pick<
  ContributionRequest,
  "kind" | "itemId" | "itemName" | "field" | "currentValue" | "proposedValue" | "details" | "sourceUrl" | "contact"
>;

const LIMITS = { itemName: 80, field: 60, currentValue: 300, proposedValue: 500, details: 3000, sourceUrl: 500, contact: 120 };

const str = (v: FormDataEntryValue | null, max: number) => {
  if (typeof v !== "string") return undefined;
  const s = v.replace(/\r\n/g, "\n").trim();
  return s ? s.slice(0, max) : undefined;
};

export type FieldErrors = Partial<Record<keyof NewRequestInput, string>>;

/** Parses and validates a submitted form. `itemExists` checks dataset ids. */
export function parseRequestForm(form: FormData, itemExists: (id: string) => boolean): { data?: NewRequestInput; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const kind = form.get("kind");
  if (typeof kind !== "string" || !(kind in REQUEST_KINDS)) errors.kind = "Choose what kind of request this is.";

  const data: NewRequestInput = {
    kind: kind as RequestKind,
    itemId: str(form.get("itemId"), 80),
    itemName: str(form.get("itemName"), LIMITS.itemName),
    field: str(form.get("field"), LIMITS.field),
    currentValue: str(form.get("currentValue"), LIMITS.currentValue),
    proposedValue: str(form.get("proposedValue"), LIMITS.proposedValue),
    details: str(form.get("details"), LIMITS.details) ?? "",
    sourceUrl: str(form.get("sourceUrl"), LIMITS.sourceUrl),
    contact: str(form.get("contact"), LIMITS.contact),
  };

  if (data.kind === "correction") {
    if (!data.itemId) errors.itemId = "Pick the item you want to correct.";
    else if (!itemExists(data.itemId)) errors.itemId = "That item was not found.";
    if (!data.field) errors.field = "Pick which information is wrong.";
    if (!data.proposedValue) errors.proposedValue = "Tell us the correct value.";
  } else if (data.kind === "new_item") {
    if (!data.itemName) errors.itemName = "Give the item's in-game name.";
    data.itemId = undefined;
  } else if (data.itemId && !itemExists(data.itemId)) {
    data.itemId = undefined;
  }
  if (data.kind !== "correction") {
    data.field = data.currentValue = data.proposedValue = undefined;
  }
  if (data.details.length < 10) errors.details = "Please describe the request in at least 10 characters.";
  if (data.sourceUrl) {
    try {
      const u = new URL(data.sourceUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    } catch {
      errors.sourceUrl = "Enter a full link starting with https://";
    }
  }
  return Object.keys(errors).length ? { errors } : { data, errors };
}
