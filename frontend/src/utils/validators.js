// Vietnamese accented characters regex
const VIETNAMESE_ACCENTS_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

// Emoji regex
const EMOJI_REGEX = /[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/;

// Dangerous chars: HTML tags, curly braces, square brackets
const DANGEROUS_CHARS_REGEX = /[<>{}［］｛｝]/;

// Combined pattern for characters that are strictly blocked in clean text inputs
const DISALLOWED_INPUT_CHARS_REGEX = /[<>{}［］｛｝]/;

export function isVietnameseAccented(value) {
  if (!value) return false;
  return VIETNAMESE_ACCENTS_REGEX.test(value);
}

export function hasEmoji(value) {
  if (!value) return false;
  return EMOJI_REGEX.test(value);
}

export function hasDangerousChars(value) {
  if (!value) return false;
  return DANGEROUS_CHARS_REGEX.test(value);
}

/**
 * Clean/sanitize text when pasted by removing dangerous characters and emojis
 */
export function sanitizeTextInput(value) {
  if (!value) return '';
  // Remove dangerous chars and emojis, also remove Vietnamese accents (or convert to plain english)
  let sanitized = value.replace(DANGEROUS_CHARS_REGEX, '');
  sanitized = sanitized.replace(EMOJI_REGEX, '');
  
  // Convert accented chars to unaccented if we want to auto-correct, or just strip them.
  // Let's strip accented chars as per strict rule, or just let submit validation fail it.
  // Wait, let's keep it simple: strip dangerous characters, and let validation check for accents.
  return sanitized;
}

export function validateUsername(value) {
  if (!value) return 'Tên đăng nhập không được để trống.';
  if (value.length < 3 || value.length > 63) {
    return 'Tên đăng nhập phải từ 3 đến 63 ký tự.';
  }
  if (isVietnameseAccented(value)) {
    return 'Tên đăng nhập không được chứa ký tự tiếng Việt có dấu.';
  }
  if (hasEmoji(value)) {
    return 'Tên đăng nhập không được chứa emoji.';
  }
  const usernamePattern = /^[A-Za-z0-9._-]+$/;
  if (!usernamePattern.test(value)) {
    return 'Tên đăng nhập chỉ chứa chữ cái không dấu, số, và các ký tự . _ -';
  }
  return null;
}

export function validatePassword(value) {
  if (!value) return 'Mật khẩu không được để trống.';
  if (value.length < 6 || value.length > 63) {
    return 'Mật khẩu phải từ 6 đến 63 ký tự.';
  }
  if (isVietnameseAccented(value)) {
    return 'Mật khẩu không được chứa ký tự tiếng Việt có dấu.';
  }
  if (hasEmoji(value)) {
    return 'Mật khẩu không được chứa emoji.';
  }
  if (value.trim() !== value) {
    return 'Mật khẩu không được bắt đầu hoặc kết thúc bằng khoảng trắng.';
  }
  return null;
}

export function validateTextInput(value, fieldName = 'Trường này', maxLength = 63) {
  if (!value || String(value).trim() === '') {
    return `${fieldName} không được để trống.`;
  }
  if (value.length > maxLength) {
    return `${fieldName} không được vượt quá ${maxLength} ký tự.`;
  }
  if (isVietnameseAccented(value)) {
    return `${fieldName} không được chứa ký tự tiếng Việt có dấu.`;
  }
  if (hasEmoji(value)) {
    return `${fieldName} không được chứa emoji.`;
  }
  if (hasDangerousChars(value)) {
    return `${fieldName} không được chứa các ký tự đặc biệt nguy hiểm (< > { } [ ]).`;
  }
  return null;
}

export function validateEmail(value, fieldName = 'Email') {
  if (!value || String(value).trim() === '') {
    return `${fieldName} không được để trống.`;
  }
  if (value.length > 63) {
    return `${fieldName} không được vượt quá 63 ký tự.`;
  }
  if (isVietnameseAccented(value)) {
    return `${fieldName} không được chứa ký tự tiếng Việt có dấu.`;
  }
  if (hasEmoji(value)) {
    return `${fieldName} không được chứa emoji.`;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    return `${fieldName} không đúng định dạng email (ví dụ: user@example.com).`;
  }
  return null;
}

export function validatePositiveNumber(value, fieldName = 'Giá trị') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} không được để trống.`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} phải là một số hợp lệ.`;
  }
  if (num <= 0) {
    return `${fieldName} phải lớn hơn 0.`;
  }
  return null;
}

export function validateNonNegativeNumber(value, fieldName = 'Giá trị') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} không được để trống.`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} phải là một số hợp lệ.`;
  }
  if (num < 0) {
    return `${fieldName} không được nhỏ hơn 0.`;
  }
  return null;
}

export function validatePositiveInteger(value, fieldName = 'Giá trị') {
  const err = validatePositiveNumber(value, fieldName);
  if (err) return err;
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return `${fieldName} phải là số nguyên.`;
  }
  return null;
}

// Handler helper to intercept KeyDown events for standard text inputs
export function handleKeyDownBlock(e) {
  // Block brackets: < > { } [ ]
  const blockedKeys = ['<', '>', '{', '}', '[', ']'];
  if (blockedKeys.includes(e.key)) {
    e.preventDefault();
    return;
  }
  
  // Block any input that would result in accented chars if possible, 
  // but keydown is hard for diacritics input methods (Telex/VNI).
  // Telex/VNI are processed after keydown (composition). 
  // So we also validate onChange and onPaste, which is robust.
}

// Handler helper to intercept KeyDown events for numbers
export function handleNumberKeyDownBlock(e) {
  // Block e, E, +, -
  const blockedKeys = ['e', 'E', '+', '-'];
  if (blockedKeys.includes(e.key)) {
    e.preventDefault();
  }
}
