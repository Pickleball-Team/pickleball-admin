import React, { useRef, useState } from 'react';
import { Table, Tag, Button, Space, Input, DatePicker, InputRef } from 'antd';
import { Sponsor } from '../../modules/Sponsor/models';
import { useGetAllSponsors } from '../../modules/Sponsor/hooks/useGetAllSponner';
import { useAcceptSponsor } from '../../modules/Sponsor/hooks/useAcceptSponsor';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import moment from 'moment';

type DataIndex = keyof Sponsor;

const SponnerPage: React.FC = () => {
  const { data, isLoading, error } = useGetAllSponsors();
  const { mutate: acceptSponsor } = useAcceptSponsor();
  const [searchText, setSearchText] = useState<string>('');
  const [searchedColumn, setSearchedColumn] = useState<string>('');
  const searchInput = useRef<InputRef>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading sponsors</div>;
  }

  const handleAccept = (sponsorId: number, isAccept: boolean) => {
    acceptSponsor({
      sponnerId: sponsorId,
      isAccept,
    });
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Sponsor> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button onClick={close} size="small" style={{ width: 90 }}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes((value as string).toLowerCase())
        : false,
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: '#ffc069', padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys: React.Key[], confirm: () => void, dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0] as string);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const columns: ColumnsType<Sponsor> = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      ...getColumnSearchProps('companyName'),
    },
    {
      title: 'Logo',
      dataIndex: 'logoUrl',
      key: 'logoUrl',
      render: (text: string) => (
        <img src={text} alt="logo" style={{ width: 50 }} />
      ),
    },
    {
      title: 'Contact Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
      ...getColumnSearchProps('contactEmail'),
    },
    {
      title: 'Description',
      dataIndex: 'descreption',
      key: 'descreption',
    },
    {
      title: 'Is Accepted',
      dataIndex: 'isAccept',
      key: 'isAccept',
      filters: [
        { text: 'Accepted', value: true },
        { text: 'Not Accepted', value: false },
      ],
      onFilter: (value, record) => record.isAccept === value,
      render: (isAccept: boolean) => (
        <Tag color={isAccept ? 'green' : 'red'}>
          {isAccept ? 'Accepted' : 'Not Accepted'}
        </Tag>
      ),
    },
    {
      title: 'Joined At',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (text: string) => moment(text).format('YYYY-MM-DD'),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            onChange={date => setSelectedKeys(date ? [date.format('YYYY-MM-DD')] : [])}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => handleSearch(selectedKeys, confirm, 'joinedAt')}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
              Reset
            </Button>
            <Button onClick={close} size="small" style={{ width: 90 }}>
              Close
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => moment(record.joinedAt).format('YYYY-MM-DD') === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Sponsor) => (
        <Space>
          {record.isAccept ? (
            <Button danger onClick={() => handleAccept(record.sponsorId, false)}>
              Unaccept
            </Button>
          ) : (
            <Button type="primary" onClick={() => handleAccept(record.sponsorId, true)}>
              Accept
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="">

      </div>
      <Table columns={columns} dataSource={data} rowKey="sponsorId" />
    </div>
  );
};

export default SponnerPage;
