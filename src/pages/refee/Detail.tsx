import { Button, Card, Spin, Tabs } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetTournamentById } from '../../modules/Tournaments/hooks/useGetTournamentById';
import MatchRoom from './containers/MatchRoom';
import PlayersTable from './containers/PlayerRegistration';

const { TabPane } = Tabs;

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetTournamentById(
    Number(id || 0)
  );
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
        <TabPane tab="Room" key="1">
          <MatchRoom id={data.id} />
        </TabPane>
        <TabPane tab="Players" key="2">
          <PlayersTable
            tournamentId={data.id}
            registrations={data.registrationDetails}
            refetch={refetch}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TournamentDetail;
