import { QRCodeSVG } from 'qrcode.react'

type QrPanelProps = {
  topicName: string
  topicUrl: string
}

export function QrPanel({ topicName, topicUrl }: QrPanelProps) {
  return (
    <aside className="qr-panel" aria-labelledby="qr-heading">
      <p className="eyebrow">Learner access</p>
      <h2 id="qr-heading">Share this question</h2>
      {topicUrl ? <div className="qr-code">
        <QRCodeSVG
          aria-label={`QR code for ${topicName}`}
          bgColor="#ffffff"
          fgColor="#182334"
          level="M"
          marginSize={2}
          size={176}
          value={topicUrl}
        />
      </div> : <p>Sign in as an educator to start a live quiz session and generate its learner QR code.</p>}
      {topicUrl && <><p>Ask learners to scan the code and respond anonymously on their device.</p><code>{topicUrl}</code></>}
    </aside>
  )
}
