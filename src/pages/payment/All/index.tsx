import { ReloadOutlined, SearchOutlined, DollarOutlined, FileDoneOutlined, ClockCircleOutlined, CalendarOutlined, PieChartOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Spin,
  Tooltip,
  Tabs,
  Select,
  Badge,
  Avatar,
} from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetAllBillsByTournamentId } from '../../../modules/Payment/hooks/useGetAllBillsByTournamentId';
import { Bill } from '../../../modules/Payment/models';
import { useGetAllBill } from '../../../modules/Payment/hooks/useGetAllBill';
import { Column, Pie } from '@ant-design/charts';
import { User } from '../../../modules/User/models';
import { fetchUserById } from '../../../modules/User/hooks/useGetUserById';

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

type DataIndex = string;

type BillTabProps = {
  id: number;
};

// Move these functions outside the component to avoid the "Cannot access before initialization" error
const getStatusTagColor = (status: number) => {
  switch (status) {
    case 1:
      return 'green'; // Paid
    case 2:
      return 'orange'; // Pending
    case 3:
      return 'red'; // Failed
    case 4:
      return 'blue'; // Refunded
    default:
      return 'default';
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return 'Paid';
    case 2:
      return 'Pending';
    case 3:
      return 'Failed';
    case 4:
      return 'Refunded';
    default:
      return 'Unknown';
  }
};

const getTypeText = (type: number) => {
  switch (type) {
    case 1:
      return 'Registration';
    case 2:
      return 'Sponsorship';
    default:
      return 'Unknown';
  }
};

const PaymentAdmin = () => {
  const { data: bills, isLoading, error, refetch } = useGetAllBill();

  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [userDetails, setUserDetails] = useState<User[]>([]);
  const searchInput = useRef<InputRef>(null);
  const userCache = useRef<Map<number, User>>(new Map());
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  useEffect(() => {
    setFilteredBills(bills || []);
  }, [bills]);

  // Fetch user details
  useEffect(() => {
    if (Array.isArray(bills) && bills.length > 0) {
      const userIds = bills.map(bill => bill.userId).filter(id => id !== undefined && id !== null);
      
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const uniqueUserIds = Array.from(new Set(userIds));
          const userPromises = uniqueUserIds.map(async (id) => {
            if (userCache.current.has(id)) {
              return userCache.current.get(id);
            } else {
              try {
                const user = await fetchUserById(id);
                if (user) {
                  userCache.current.set(id, user);
                }
                return user;
              } catch (error) {
                console.error(`Error fetching user with ID ${id}:`, error);
                return null;
              }
            }
          });

          const users = await Promise.all(userPromises);
          setUserDetails(users.filter(user => user !== null) as User[]);
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [bills]);

  // Helper function to get user details by ID
  const getUserById = (userId: number): User | undefined => {
    return userDetails.find(user => user.id === userId);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!bills || !bills.length) {
      return {
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
        billCount: 0,
        paidCount: 0,
        pendingCount: 0,
        registrationAmount: 0,
        sponsorshipAmount: 0,
        registrationCount: 0,
        sponsorshipCount: 0,
      };
    }

    // Ensure consistent type handling - convert status to number if it's a string
    const paid = bills.filter((bill) => Number(bill.status) === 1);
    const pending = bills.filter((bill) => Number(bill.status) === 2);
    const registrations = bills.filter((bill) => Number(bill.type) === 1);
    const sponsorships = bills.filter((bill) => Number(bill.type) === 2);

    return {
      totalAmount: bills.reduce((sum, bill) => sum + bill.amount, 0),
      totalPaid: paid.reduce((sum, bill) => sum + bill.amount, 0),
      totalPending: pending.reduce((sum, bill) => sum + bill.amount, 0),
      billCount: bills.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      registrationAmount: registrations.reduce((sum, bill) => sum + bill.amount, 0),
      sponsorshipAmount: sponsorships.reduce((sum, bill) => sum + bill.amount, 0),
      registrationCount: registrations.length,
      sponsorshipCount: sponsorships.length,
    };
  }, [bills]);

  // Prepare data for charts
  const statusData = useMemo(() => {
    if (!bills) return [];

    const statusCounts = bills.reduce(
      (acc, bill) => {
        const status = getStatusText(Number(bill.status));
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statusCounts).map(([status, count]) => ({
      type: status,
      value: count,
    }));
  }, [bills]);

  const paymentMethodData = useMemo(() => {
    if (!bills) return [];

    const methodCounts = bills.reduce(
      (acc, bill) => {
        const method = bill.paymentMethod || 'Unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(methodCounts).map(([method, count]) => ({
      type: method,
      value: count,
    }));
  }, [bills]);

  const paymentTypeData = useMemo(() => {
    if (!bills) return [];

    const typeAmounts = bills.reduce(
      (acc, bill) => {
        const type = Number(bill.type) === 1 ? 'Registration' : 'Sponsorship';
        acc[type] = (acc[type] || 0) + bill.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(typeAmounts).map(([type, amount]) => ({
      type: type,
      value: amount,
    }));
  }, [bills]);

  // Monthly payment data
  const monthlyPaymentsData = useMemo(() => {
    if (!bills) return [];

    // Create empty data for all months
    const months = Array.from({ length: 12 }, (_, i) => {
      return {
        month: new Date(yearFilter, i).toLocaleString('default', { month: 'short' }),
        monthIndex: i,
        Registration: 0,
        Sponsorship: 0,
        Total: 0,
      };
    });

    // Fill data from bills
    bills.forEach(bill => {
      const paymentDate = bill.paymentDate ? new Date(bill.paymentDate) : null;
      if (paymentDate && paymentDate.getFullYear() === yearFilter) {
        const monthIndex = paymentDate.getMonth();
        const type = Number(bill.type) === 1 ? 'Registration' : 'Sponsorship';
        
        // Add to the specific type
        months[monthIndex][type] += bill.amount;
        
        // Add to total
        months[monthIndex].Total += bill.amount;
      }
    });

    // Format for chart - create an array of objects for each month/type combination
    const chartData: any[] = [];
    months.forEach(month => {
      chartData.push({
        month: month.month,
        type: 'Registration',
        amount: month.Registration
      });
      chartData.push({
        month: month.month,
        type: 'Sponsorship',
        amount: month.Sponsorship
      });
      chartData.push({
        month: month.month,
        type: 'Total',
        amount: month.Total
      });
    });

    return chartData;
  }, [bills, yearFilter]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters?: () => void) => {
    if (clearFilters) {
      clearFilters();
    }
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<any> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            ?.toLowerCase()
            .includes((value as string).toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  const columns: ColumnsType<Bill> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#389e0d' }}>
          ₫{amount.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId: number, record: Bill) => {
        const user = getUserById(userId);
        if (loadingUsers) {
          return <Spin size="small" />;
        }
        if (user) {
          return (
            <Space>
              <Avatar 
                icon={<UserOutlined />} 
                src={user.avatarUrl} 
                style={{ backgroundColor: user.avatarUrl ? undefined : '#1890ff' }}
              />
              <Tooltip title={`${user.email || 'No email'}`}>
                <span>{`${user.firstName || ''} ${user.lastName || ''}`}</span>
              </Tooltip>
            </Space>
          );
        }
        return <span>User ID: {userId}</span>;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        // Custom filter for user names
        const users = userDetails.filter(u => u !== null);
        
        return (
          <div style={{ padding: 8 }}>
            <Select
              showSearch
              style={{ width: 200, marginBottom: 8 }}
              placeholder="Search by user"
              optionFilterProp="children"
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              filterOption={(input, option) => 
                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                value: user.id,
                label: `${user.firstName || ''} ${user.lastName || ''}`,
              }))}
              value={selectedKeys[0]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <Button
                type="primary"
                onClick={() => confirm()}
                size="small"
                style={{ width: 90 }}
              >
                Filter
              </Button>
              <Button
                onClick={() => clearFilters && clearFilters()}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </div>
          </div>
        );
      },
      filterIcon: (filtered) => (
        <UserOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => record.userId === value,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ...getColumnSearchProps('note'),
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => <Tag color="blue">{method}</Tag>,
      filters: [
        { text: 'VNPAY', value: 'VNPAY' },
        { text: 'Cash', value: 'Cash' },
        { text: 'Bank Transfer', value: 'Bank Transfer' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: number | string) => (
        <Tag color={getStatusTagColor(Number(status))}>
          {getStatusText(Number(status))}
        </Tag>
      ),
      filters: [
        { text: 'Paid', value: 1 },
        { text: 'Pending', value: 2 },
        { text: 'Failed', value: 3 },
        { text: 'Refunded', value: 4 },
      ],
      onFilter: (value, record) => Number(record.status) === value,
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (text: string) =>
        text ? new Date(text).toLocaleString() : 'Not paid yet',
      sorter: (a, b) => {
        if (!a.paymentDate) return 1;
        if (!b.paymentDate) return -1;
        return (
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: number | string) => {
        const typeNum = Number(type);
        const typeText = getTypeText(typeNum);
        return <Tag color={typeNum === 1 ? 'green' : 'purple'}>{typeText}</Tag>;
      },
      filters: [
        { text: 'Registration', value: 1 },
        { text: 'Sponsorship', value: 2 },
      ],
      onFilter: (value, record) => Number(record.type) === value,
    },
  ];

  const pieConfig = {
    appendPadding: 10,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  const renderPaymentTypePieChart = () => {
    const config = {
      ...pieConfig,
      data: paymentTypeData,
      color: ['#52c41a', '#722ed1'],
      radius: 0.7,
      innerRadius: 0.6,
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value} ₫',
        style: {
          textAlign: 'center',
          fontSize: '14px',
          fill: '#fff',
        },
      },
      statistic: {
        title: {
          style: {
            fontSize: '14px',
          },
          content: 'Payment',
        },
        content: {
          style: {
            fontSize: '16px',
          },
          content: 'Types',
        },
      },
    };
    return <Pie {...config} />;
  };

  const renderStatusPieChart = () => {
    const config = {
      ...pieConfig,
      data: statusData,
      color: ['#52c41a', '#faad14', '#f5222d', '#1890ff'],
      radius: 0.7,
      innerRadius: 0.6,
      label: {
        type: 'inner',
        offset: '-50%',
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: '14px',
          fill: '#fff',
        },
      },
      statistic: {
        title: {
          style: {
            fontSize: '14px',
          },
          content: 'Payment',
        },
        content: {
          style: {
            fontSize: '16px',
          },
          content: 'Status',
        },
      },
    };
    return <Pie {...config} />;
  };

  const renderMonthlyChart = () => {
    const config = {
      data: monthlyPaymentsData,
      isGroup: true,
      xField: 'month',
      yField: 'amount',
      seriesField: 'type',
      marginRatio: 0.1, 
      columnWidthRatio: 0.8,
      columnStyle: {
      radius: [40, 40, 0, 0],
      },
      color: ['#52c41a', '#722ed1', '#1890ff'],
      label: {
      position: 'top' as const,
      style: { fill: 'black', opacity: 0.6 },
      },
      legend: {
      position: 'top-right' as 'top-right',
      },
      autoFit: true,
      padding: [30, 30, 50, 50],
    };

    return <Column {...config} />;
  };

  const filterBillsByTab = () => {
    if (!bills) return [];
    switch (activeTab) {
      case 'paid':
        return bills.filter(bill => Number(bill.status) === 1);
      case 'pending':
        return bills.filter(bill => Number(bill.status) === 2);
      case 'registration':
        return bills.filter(bill => Number(bill.type) === 1);
      case 'sponsorship':
        return bills.filter(bill => Number(bill.type) === 2);
      case 'all':
      default:
        return bills;
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Loading payment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={4} type="danger">Error loading payment data</Title>
          <p>{(error as Error).message}</p>
          <Button type="primary" onClick={() => refetch()} icon={<ReloadOutlined />}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="payment-admin-container">

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic
              title={<Text strong style={{ fontSize: '16px' }}>Total Revenue</Text>}
              value={statistics.totalAmount}
              precision={0}
              valueStyle={{ color: '#3f8600', fontSize: '24px' }}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => value?.toLocaleString()}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status="success" text={<Text type="secondary">{statistics.billCount} transactions</Text>} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic
              title={<Text strong style={{ fontSize: '16px' }}>Paid</Text>}
              value={statistics.totalPaid}
              precision={0}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              prefix={<FileDoneOutlined />}
              suffix="₫"
              formatter={(value) => value?.toLocaleString()}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status="success" text={<Text type="secondary">{statistics.paidCount} payments</Text>} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Statistic
              title={<Text strong style={{ fontSize: '16px' }}>Pending</Text>}
              value={statistics.totalPending}
              precision={0}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
              prefix={<ClockCircleOutlined />}
              suffix="₫"
              formatter={(value) => value?.toLocaleString()}
            />
            <div style={{ marginTop: '8px' }}>
              <Badge status="warning" text={<Text type="secondary">{statistics.pendingCount} payments</Text>} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} hoverable style={{ height: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
            <Row gutter={8}>
              <Col span={12}>
                <Statistic
                  title={<Text strong style={{ fontSize: '14px' }}>Registration</Text>}
                  value={statistics.registrationAmount}
                  precision={0}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  formatter={(value) => `₫${value?.toLocaleString()}`}
                />
                <Text type="secondary">{statistics.registrationCount} payments</Text>
              </Col>
              <Col span={12}>
                <Statistic
                  title={<Text strong style={{ fontSize: '14px' }}>Sponsorship</Text>}
                  value={statistics.sponsorshipAmount}
                  precision={0}
                  valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                  formatter={(value) => `₫${value?.toLocaleString()}`}
                />
                <Text type="secondary">{statistics.sponsorshipCount} payments</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={24} lg={16}>
          <Card 
            bordered={false} 
            title={
              <Space>
                <BarChartOutlined style={{ color: '#1890ff' }} />
                <span>Monthly Payment Analysis</span>
                <Select
                  value={yearFilter}
                  onChange={(value) => setYearFilter(value)}
                  style={{ marginLeft: 16, width: 100 }}
                >
                  {[2023, 2024, 2025].map(year => (
                    <Option key={year} value={year}>{year}</Option>
                  ))}
                </Select>
              </Space>
            }
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
          >
            <div style={{ height: 320 }}>
              {renderMonthlyChart()}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card 
            bordered={false} 
            title={<Space><PieChartOutlined style={{ color: '#722ed1' }} /><span>Payment Distribution</span></Space>}
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Tabs defaultActiveKey="type" centered>
                  <TabPane tab="By Type" key="type">
                    <div style={{ height: 250 }}>
                      {renderPaymentTypePieChart()}
                    </div>
                  </TabPane>
                  <TabPane tab="By Status" key="status">
                    <div style={{ height: 250 }}>
                      {renderStatusPieChart()}
                    </div>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Payment Records */}
      <Card 
        bordered={false} 
        title={
          <Space>
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span>Payment Records</span>
            {loadingUsers && <Spin size="small" />}
          </Space>
        }
        style={{ borderRadius: '8px', marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
        extra={
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
          tabBarStyle={{ marginBottom: 16 }}
        >
          <TabPane 
            tab={
              <Tooltip title="All Payments">
                <Space>
                  <span>All</span>
                  <Badge count={statistics.billCount} style={{ backgroundColor: '#1890ff' }} /> 
                </Space>
              </Tooltip>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <Tooltip title="Paid Payments">
                <Space>
                  <span>Paid</span>
                  <Badge count={statistics.paidCount} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              </Tooltip>
            } 
            key="paid" 
          />
          <TabPane 
            tab={
              <Tooltip title="Pending Payments">
                <Space>
                  <span>Pending</span>
                  <Badge count={statistics.pendingCount} style={{ backgroundColor: '#faad14' }} />
                </Space>
              </Tooltip>
            } 
            key="pending" 
          />
          <TabPane 
            tab={
              <Tooltip title="Registration Payments">
                <Space>
                  <span>Registration</span>
                  <Badge count={statistics.registrationCount} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              </Tooltip>
            } 
            key="registration" 
          />
          <TabPane 
            tab={
              <Tooltip title="Sponsorship Payments">
                <Space>
                  <span>Sponsorship</span>
                  <Badge count={statistics.sponsorshipCount} style={{ backgroundColor: '#722ed1' }} />
                </Space>
              </Tooltip>
            } 
            key="sponsorship" 
          />
        </Tabs>
        
        <Table
          columns={columns}
          dataSource={filterBillsByTab()}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          bordered
          size="middle"
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => {
            if (Number(record.status) === 2) return 'pending-row';
            if (Number(record.status) === 3) return 'failed-row';
            return '';
          }}
          summary={(pageData) => {
            let totalAmount = 0;
            pageData.forEach(({ amount }) => {
              totalAmount += amount;
            });
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>Page Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    <Text strong style={{ color: '#389e0d' }}>
                      ₫{totalAmount.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={5}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>

      <style>
        {`
          .pending-row {
            background-color: #fffbe6;
          }
          .failed-row {
            background-color: #fff1f0;
          }
          .payment-admin-container .ant-table-thead > tr > th {
            background-color: #f6ffed;
            font-weight: bold;
          }
          .payment-admin-container .ant-statistic-content {
            font-family: 'Arial', sans-serif;
          }
        `}
      </style>
    </div>
  );
};

export default PaymentAdmin;
