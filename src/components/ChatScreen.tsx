import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';
import { ChatScreenContent } from './ChatScreenContent';

export const ChatScreen = () => {
  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-6">
        <PageHeader
          title="AI Assistant"
          description="Your personalized learning companion"
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
        />

        <Card padding="lg">
          <ChatScreenContent />
        </Card>
      </div>
    </PageContainer>
  );
};
