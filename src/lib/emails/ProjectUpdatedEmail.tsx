import {
  Html,
  Body,
  Container,
  Text,
  Button,
  Heading,
} from "@react-email/components";

interface ProjectUpdatedEmailProps {
  memberName: string;
  projectTitle: string;
  changeSummary: string;
  projectUrl: string;
}

export default function ProjectUpdatedEmail({
  memberName,
  projectTitle,
  changeSummary,
  projectUrl,
}: ProjectUpdatedEmailProps) {
  return (
    <Html>
      <Body
        style={{
          fontFamily: '"Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#FFFAF5",
          padding: "20px",
          margin: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid #F0E8DF",
          }}
        >
          <Heading
            style={{
              color: "#2D2D2D",
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "24px",
              marginTop: 0,
            }}
          >
            🌸 プロジェクトが更新されました
          </Heading>

          <Text
            style={{
              color: "#2D2D2D",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            江口ファミリーの皆さんへ
          </Text>

          <Text
            style={{
              color: "#2D2D2D",
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            {memberName}さんが「{projectTitle}」に新しい内容を追加しました。
          </Text>

          <Container
            style={{
              backgroundColor: "#FDECEA",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                color: "#2D2D2D",
                fontSize: "14px",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {changeSummary}
            </Text>
          </Container>

          <Button
            href={projectUrl}
            style={{
              backgroundColor: "#F97B6B",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 600,
              padding: "14px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              display: "inline-block",
              border: "none",
            }}
          >
            プロジェクトを見る →
          </Button>

          <Text
            style={{
              color: "#9E9E9E",
              fontSize: "12px",
              lineHeight: "1.6",
              marginTop: "32px",
              marginBottom: 0,
            }}
          >
            このメールは江口ファミリーハブから自動送信されました。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
