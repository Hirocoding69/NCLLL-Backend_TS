export function bindCtx<T>(target: T): T {
  return new Proxy(target as object, {
    get(obj, prop) {
      const value = (obj as any)[prop as any];
      if (typeof value === "function") {
        return value.bind(obj);
      }
      return value;
    },
  }) as T;
}

export const renameKeys = <T extends Record<string, any> | null>(
  obj: T,
  keyMap: Record<string, string>
): Record<string, any> => {
  if (!obj) return {}; // Handle null case
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key;
    acc[newKey] = obj[key];
    return acc;
  }, {} as Record<string, any>);
};

// // Example:
// const user = { id: 1, username: "HiroHori", email: "hiro@example.com" };
// const renamedUser = renameKeys(user, { username: "user_name", email: "contact_email" });
// // Output: { id: 1, user_name: "HiroHori", contact_email: "hiro@example.com" }
