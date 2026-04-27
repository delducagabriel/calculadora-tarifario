// role="alert" faz leitores de tela anunciarem o conteúdo imediatamente quando ele aparecer no DOM sem o usuário precisar focar no elemento
// é importante para acessibilidade, especialmente para mensagens de erro

export default function ErrorBanner({ message }) {
  return (
    <div className="error-banner" role="alert">
      <span aria-hidden="true">⚠</span>
      {message}
    </div>
  )
}