import { Col, Flex, Row, Typography } from 'antd';
import { AUTHENTICATION_ITEMS, ERROR_ITEMS } from '../constants';
import { useStylesContext } from '../context';
import { BranchesOutlined } from '@ant-design/icons';

const SITES = [
  {
    title: 'authentication',
    links: AUTHENTICATION_ITEMS,
  },
  {
    title: 'errors',
    links: ERROR_ITEMS,
  },
];

export const SitemapPage = () => {
  const context = useStylesContext();

  return (
    <div>
      <Flex vertical gap="middle">
        <Typography.Title level={3}>
          <BranchesOutlined /> Sitemap
        </Typography.Title>
        <Row {...context?.rowProps}>
          {SITES.map((s) => (
            <Col xs={24} sm={12} md={8} xl={6} key={`col-${s.title}`}>
              {/* update site map card in here */}
            </Col>
          ))}
        </Row>
      </Flex>
    </div>
  );
};
