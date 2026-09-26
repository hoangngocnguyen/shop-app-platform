import themeConfig from '@/theme.config.json';

export function getThemeStyles(): string {
  const { theme } = themeConfig;

  // Chuyển camelCase (primaryHover) thành kebab-case (--color-primary-hover-val)
  const cssVariables = Object.entries(theme)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--color-${kebabKey}-val: ${value};`;
    })
    .join(" ");

  return `:root { ${cssVariables} }`;
}