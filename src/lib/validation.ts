// 共通のバリデーション関数

export const validatePrompt = (prompt: string): string | null => {
  if (!prompt.trim()) {
    return "プロンプトを入力してください";
  }
  if (prompt.length > 500) {
    return "プロンプトは500文字以内で入力してください";
  }
  return null;
};

export const validateTitle = (title: string): string | null => {
  if (!title.trim()) {
    return "タイトルを入力してください";
  }
  if (title.length > 100) {
    return "タイトルは100文字以内で入力してください";
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (!description.trim()) {
    return "説明を入力してください";
  }
  if (description.length > 1000) {
    return "説明は1000文字以内で入力してください";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    return "メールアドレスを入力してください";
  }
  if (!emailRegex.test(email)) {
    return "有効なメールアドレスを入力してください";
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName}を入力してください`;
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value.length < minLength) {
    return `${fieldName}は${minLength}文字以上で入力してください`;
  }
  return null;
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): string | null => {
  if (value.length > maxLength) {
    return `${fieldName}は${maxLength}文字以内で入力してください`;
  }
  return null;
};
