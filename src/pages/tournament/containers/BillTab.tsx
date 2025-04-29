import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Card, Col, Divider, Input, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetAllBillsByTournamentId } from '../../../modules/Payment/hooks/useGetAllBillsByTournamentId';
import { Bill } from '../../../modules/Payment/models';

const { Text, Title } = Typography;

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
      return 'Sponsorship';
    case 2:
      return 'Registration';
    case 3:
      return 'Reward';
    default:
      return 'Unknown';
  }
};

const BillTab = ({ id }: BillTabProps) => {
  const {
    data: bills,
    isLoading,
    error,
    refetch,
  } = useGetAllBillsByTournamentId(Number(id));
  
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);
  
  useEffect(() => {
    setFilteredBills(bills || []);
  }, [bills]);

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
        rewardAmount: 0,
        registrationCount: 0,
        sponsorshipCount: 0,
        rewardCount: 0,
      };
    }

    // Ensure consistent type handling - convert status to number if it's a string
    const paid = bills.filter(bill => Number(bill.status) === 1);
    const pending = bills.filter(bill => Number(bill.status) === 2);
    const sponsorships = bills.filter(bill => Number(bill.type) === 1);
    const registrations = bills.filter(bill => Number(bill.type) === 2);
    const rewards = bills.filter(bill => Number(bill.type) === 3);

    return {
      totalAmount: bills.reduce((sum, bill) => sum + bill.amount, 0),
      totalPaid: paid.reduce((sum, bill) => sum + bill.amount, 0),
      totalPending: pending.reduce((sum, bill) => sum + bill.amount, 0),
      billCount: bills.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      registrationAmount: registrations.reduce(
        (sum, bill) => sum + bill.amount,
        0
      ),
      sponsorshipAmount: sponsorships.reduce(
        (sum, bill) => sum + bill.amount,
        0
      ),
      rewardAmount: rewards.reduce(
        (sum, bill) => sum + bill.amount,
        0
      ),
      registrationCount: registrations.length,
      sponsorshipCount: sponsorships.length,
      rewardCount: rewards.length,
    };
  }, [bills]);

  // Prepare data for charts
  const statusData = useMemo(() => {
    if (!bills) return [];
    
    const statusCounts = bills.reduce((acc, bill) => {
      const status = getStatusText(Number(bill.status));
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      type: status,
      value: count,
    }));
  }, [bills]);

  const paymentMethodData = useMemo(() => {
    if (!bills) return [];
    
    const methodCounts = bills.reduce((acc, bill) => {
      const method = bill.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([method, count]) => ({
      type: method,
      value: count,
    }));
  }, [bills]);

  const paymentTypeData = useMemo(() => {
    if (!bills) return [];
    
    const typeAmounts = bills.reduce((acc, bill) => {
      const typeNum = Number(bill.type);
      const typeName = getTypeText(typeNum); // Using getTypeText function for consistent mapping
      acc[typeName] = (acc[typeName] || 0) + bill.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeAmounts).map(([type, amount]) => ({
      type: type,
      value: amount,
    }));
  }, [bills]);

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
        <Text strong style={{ color: '#389e0d' }}>₫{amount.toLocaleString()}</Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
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
      render: (method: string) => (
        <Tag color="blue">{method}</Tag>
      ),
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
      render: (text: string) => text ? new Date(text).toLocaleString() : 'Not paid yet',
      sorter: (a, b) => {
        if (!a.paymentDate) return 1;
        if (!b.paymentDate) return -1;
        return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: number | string) => {
        const typeNum = Number(type);
        const typeText = getTypeText(typeNum);
        let color = 'blue';
        if (typeNum === 1) color = 'green';
        else if (typeNum === 2) color = 'purple';
        else if (typeNum === 3) color = '#1890ff';
        return <Tag color={color}>{typeText}</Tag>;
      },
      filters: [
        { text: 'Sponsorship', value: 1 },
        { text: 'Registration', value: 2 },
        { text: 'Reward', value: 3 },
      ],
      onFilter: (value, record) => Number(record.type) === value,
    }
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

  if (isLoading) {
    return <div>Loading bills...</div>;
  }

  if (error) {
    return <div>Error loading bills: {(error as Error).message}</div>;
  }

  return (
    <div className="bill-tab-container">
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Total Revenue"
              value={statistics.totalAmount}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix="₫"
              suffix=""
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Total Paid"
              value={statistics.totalPaid}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix="₫"
              suffix={`(${statistics.paidCount} bills)`}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Total Pending"
              value={statistics.totalPending}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix="₫"
              suffix={`(${statistics.pendingCount} bills)`}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      {/* Payment Type Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Registration Payments"
              value={statistics.registrationAmount}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix="₫"
              suffix={`(${statistics.registrationCount})`}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Sponsorship Payments"
              value={statistics.sponsorshipAmount}
              precision={0}
              valueStyle={{ color: '#722ed1' }}
              prefix="₫"
              suffix={`(${statistics.sponsorshipCount})`}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="summary-card">
            <Statistic
              title="Reward Payments"
              value={statistics.rewardAmount}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix="₫"
              suffix={`(${statistics.rewardCount})`}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left">Payment Records</Divider>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        onClick={() => refetch()}
        style={{ marginBottom: 16 }}
      >
        Refresh Bills
      </Button>
      <Table 
        columns={columns} 
        dataSource={filteredBills} 
        rowKey="id" 
        pagination={{ pageSize: 10 }}
        summary={(pageData) => {
          let totalAmount = 0;
          pageData.forEach(({ amount }) => {
            totalAmount += amount;
          });
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>Page Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <Text strong style={{ color: '#389e0d' }}>₫{totalAmount.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={5}>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    </div>
  );
};

export default BillTab;
