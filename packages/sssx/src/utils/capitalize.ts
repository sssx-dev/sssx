export const capitalize = (s:string) =>
    !s || s.length === 0
    ? s
    : s.length === 1
    ? s.toUpperCase()
    : s[0].toUpperCase() + s.substring(1)