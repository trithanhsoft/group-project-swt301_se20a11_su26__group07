const STRUCTURED_NOTE_REGEX =
  /^\[(?<context>[A-Z_]+)\|(?<eventDate>\d{4}-\d{2}-\d{2})\|(?<sessionCode>[A-Z0-9-]+)\]\s*(?<userNote>.*)$/s;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildStructuredStockNote({
  context,
  eventDate,
  sessionCode,
  note = '',
} = {}) {
  const normalizedContext = normalizeString(context).toUpperCase();
  const normalizedEventDate = normalizeString(eventDate);
  const normalizedSessionCode = normalizeString(sessionCode).toUpperCase();
  const normalizedNote = normalizeString(note);

  if (!normalizedContext || !normalizedEventDate || !normalizedSessionCode) {
    return normalizedNote;
  }

  const prefix = `[${normalizedContext}|${normalizedEventDate}|${normalizedSessionCode}]`;
  return normalizedNote ? `${prefix} ${normalizedNote}` : prefix;
}

export function parseStructuredStockNote(note) {
  const rawNote = normalizeString(note);

  if (!rawNote) {
    return {
      context: null,
      eventDate: null,
      sessionCode: null,
      userNote: '',
      rawNote: '',
    };
  }

  const match = rawNote.match(STRUCTURED_NOTE_REGEX);

  if (!match?.groups) {
    return {
      context: null,
      eventDate: null,
      sessionCode: null,
      userNote: rawNote,
      rawNote,
    };
  }

  return {
    context: match.groups.context || null,
    eventDate: match.groups.eventDate || null,
    sessionCode: match.groups.sessionCode || null,
    userNote: normalizeString(match.groups.userNote),
    rawNote,
  };
}

export default {
  buildStructuredStockNote,
  parseStructuredStockNote,
};
