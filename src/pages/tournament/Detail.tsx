import { Button, Card, Spin, Tabs, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Rank from '../../components/Rank';
import { useCheckRewardTournament } from '../../modules/Tournaments/hooks/useCheckRewardTournament';
import { useGetTournamentById } from '../../modules/Tournaments/hooks/useGetTournamentById';
import BillTab from './containers/BillTab';
import MatchRoom from './containers/MatchRoom';
import PlayersTable from './containers/PlayerRegistration';
import Policy from './containers/Policy';
import TournamentInfoForm from './containers/TournamentInfoForm';

import { useRankRewardTournament } from '../../modules/Tournaments/hooks/useRankRewardTournament';

const { TabPane } = Tabs;

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch } = useGetTournamentById(
    Number(id || 0)
  );

  const {mutateAsync} = useRankRewardTournament()
  
  const {data: Reward} = useCheckRewardTournament(id || "0");
  
  const navigate = useNavigate();
  
  const handleSave = (values: any) => {
    console.log('Saved values:', values);
    // Implement save logic here, e.g., send a request to the server
  };

  const handleGiveReward = async () => {
    try {
      mutateAsync(id || "0");
      message.success("Rewards distributed successfully!");
      // Refresh the reward status
      refetch();
    } catch (error) {
      message.error("Failed to distribute rewards. Please try again.");
      console.error("Error giving rewards:", error);
    }
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

  // Check if tournament is completed and rewards not yet given
  const showRewardButton = Boolean(data.status === 'Completed' && 
    Reward &&
    Reward.isReward === false);
    console.log("show",showRewardButton,data.status,Reward);
    
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        {showRewardButton && (
            <Button
              type="primary"
              danger
              size="large"
              icon={<i className="fas fa-trophy" style={{ marginRight: 8 }} />}
              style={{ 
                backgroundColor: '#faad14', 
                borderColor: '#d48806', 
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(250, 173, 20, 0.5)',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={handleGiveReward}
            >
              Distribute Rewards
            </Button>
        )}
      </div>
      
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

        <TabPane tab="Tournament Info" key="4">
          <Card title="Tournament Info" bordered={false}>
            <TournamentInfoForm data={data} onSave={handleSave} />
          </Card>
        </TabPane>
        <TabPane tab="Policy" key="5">
          <Policy id={data.id} data={data} refetch={refetch} />
        </TabPane>
        <TabPane tab="Bill" key="6">
          <BillTab id={data.id} />
        </TabPane>
        <TabPane tab="Rank" key="7">
          <Rank tournamentId={data.id}/>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TournamentDetail;
