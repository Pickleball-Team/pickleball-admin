import { Button, Card, Spin, Tabs, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTournamentById } from '../../modules/Tournaments/hooks/useGetTournamentById';
import PlayersTable from './containers/PlayerRegistration';
import TournamentInfoForm from './containers/TournamentInfoForm';
import TournamentMatches from './containers/TournamentMatches';

const { TabPane } = Tabs;

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetTournamentById(Number(id || 0));
  const navigate = useNavigate();

  const handleSave = (values: any) => {
    console.log('Saved values:', values);
    // Implement save logic here, e.g., send a request to the server
  };

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (error) {
    return <div>Error loading tournament details</div>;
  }

  if (!data) {
    return <div>No tournament data found</div>;
  }

  return (
    <div>
      <Button
        type="primary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      <Tabs defaultActiveKey="1">
      <TabPane tab="Players" key="2">
          <PlayersTable registrations={data.registrationDetails} />
        </TabPane>
        <TabPane tab="Tournament Matches" key="1">
          <TournamentMatches details={data.touramentDetails} />
        </TabPane>
        <TabPane tab="Tournament Info" key="3">
          <Card title="Tournament Info" bordered={false}>
            <TournamentInfoForm data={data} onSave={handleSave} />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TournamentDetail;
