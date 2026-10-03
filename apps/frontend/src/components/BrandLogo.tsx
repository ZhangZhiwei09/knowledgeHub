/** Knowledge Hub 品牌标：中心节点向外辐射，表示知识汇聚 */
export function BrandLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="32" height="32" rx="8" fill="var(--kh-primary)" />
      <path
        d="M16 12.6V8.6M19.1 17.8l3.9 2.2M12.9 17.8L9 20"
        stroke="var(--kh-bg-container)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.4" fill="var(--kh-bg-container)" />
      <circle cx="16" cy="7.2" r="2" fill="var(--kh-primary-border)" />
      <circle cx="24.8" cy="21.2" r="2" fill="var(--kh-primary-border)" />
      <circle cx="7.2" cy="21.2" r="2" fill="var(--kh-primary-border)" />
      <circle cx="16" cy="7.2" r="1.15" fill="var(--kh-bg-container)" />
      <circle cx="24.8" cy="21.2" r="1.15" fill="var(--kh-bg-container)" />
      <circle cx="7.2" cy="21.2" r="1.15" fill="var(--kh-bg-container)" />
    </svg>
  )
}
