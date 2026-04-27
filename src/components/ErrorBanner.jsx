export default function ErrorBanner({ message }) {
  return (
    <div className="error-banner" role="alert">
      <span aria-hidden="true">⚠</span>
      {message}
    </div>
  )
}