import { PaperClipOutlined, SmileOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  Button,
  Col,
  ConfigProvider,
  Descriptions,
  Divider,
  message,
  Row,
  Space,
  Typography,
} from 'antd';
import axios from 'axios';
import copy from 'copy-to-clipboard';
import { ComponentProps, useEffect, useRef, useState } from 'react';

const { Paragraph, Link } = Typography;

const qs = (params: Record<string, string | number>) => {
  return Object.entries(params)
    .filter(([key, val]) => !!val)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
};

export default function HomePage() {
  const form = useRef<ProFormInstance>(null);
  const [targetEnum] = useState({
    clash: {
      text: 'Clash',
    },
    'surge&ver=3': {
      text: 'Surge3',
    },
    'surge&ver=4': {
      text: 'Surge4',
    },
    quan: {
      text: 'Quantumult',
    },
    quanx: {
      text: 'QuantumultX',
    },
    surfboard: {
      text: 'Surfboard',
    },
    loon: {
      text: 'Loon',
    },
    sssub: {
      text: 'SSAndroid',
    },
    v2ray: {
      text: 'V2Ray',
    },
    ss: {
      text: 'ss',
    },
    ssr: {
      text: 'ssr',
    },
    ssd: {
      text: 'ssd',
    },
    clashr: {
      text: 'ClashR',
    },
    'surge&ver=2': {
      text: 'Surge2',
    },
  });
  const [initialValues] = useState({
    mode: 'base',
    target: 'clash',
    request: 'https://subscribe.leroytop.com/sub',
    extra: ['emoji', 'fdn', 'expand'],
    config: `https://raw.githubusercontent.com/leroy20317/ACL4SSR/main/Clash/config/Custom.ini`,
  });
  const [handleUrl, setHandleUrl] = useState('');
  const [configOptions, setConfigOptions] = useState<
    Required<ComponentProps<typeof ProFormSelect>['options']>
  >([
    {
      label: 'Custom',
      value: initialValues.config,
    },
  ]);
  useEffect(() => {
    (async () => {
      const { data } = await axios.get(
        'https://api.github.com/repos/ACL4SSR/ACL4SSR/git/trees/544f3b0c4b1ad20759c84352e954230900c0ea2b',
      );
      setConfigOptions([
        {
          label: 'Custom',
          value: initialValues.config,
        },
        {
          label: 'ACL4SSR',
          options: data.tree.map((ele: { path: string }) => ({
            label: `${ele.path}${
              ele.path.includes('Online') ? ' (同步GitHub)' : ''
            }`,
            value: `https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/${ele.path}`,
          })),
        },
      ]);
    })();
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <ProCard
        title="Subscription Converter"
        extra={
          <Link
            href="https://github.com/tindy2013/subconverter/blob/master/README-cn.md#%E8%B0%83%E7%94%A8%E8%AF%B4%E6%98%8E-%E8%BF%9B%E9%98%B6"
            target="_blank"
          >
            参数说明
          </Link>
        }
        bordered
        headerBordered
        boxShadow
      >
        <ProForm
          formRef={form}
          initialValues={initialValues}
          onFinish={async ({ mode, ...params }) => {
            console.log('params', initialValues.request, params);
            const url = `${initialValues.request}?${qs(params)}`;
            setHandleUrl(url);
            copy(url);
            message.success('生成并复制成功！');
            return true;
          }}
          onReset={() => setHandleUrl('')}
          layout="horizontal"
          labelCol={{ lg: { span: 2 }, sm: { span: 2 } }}
          wrapperCol={{ lg: { span: 21 }, sm: { span: 21 } }}
          submitter={{
            render: (props, doms) => (
              <Row>
                <Col lg={{ span: 21, offset: 2 }} sm={{ span: 21, offset: 2 }}>
                  <Space>
                    {doms}
                    <ModalForm<{
                      url: string;
                    }>
                      title="解析链接"
                      trigger={
                        <div>
                          <ConfigProvider
                            theme={{
                              token: {
                                colorPrimary: '#52c41a',
                              },
                            }}
                          >
                            <Button type="primary">解析链接</Button>
                          </ConfigProvider>
                        </div>
                      }
                      autoFocusFirstInput
                      modalProps={{
                        destroyOnClose: true,
                      }}
                      submitTimeout={2000}
                      onFinish={async (values) => {
                        // await waitTime(2000);
                        console.log(values.url);
                        const [host, search] = values.url.split('?');
                        const params = Object.fromEntries(
                          new URLSearchParams(search),
                        );
                        const {
                          target,
                          ver,
                          url,
                          config,
                          include,
                          exclude,
                          filename,
                          list,
                          emoji,
                          scv,
                          sort,
                          fdn,
                          udp,
                          expand,
                          classic,
                          ...others
                        } = params;

                        const fields = Object.assign<
                          Record<string, string>,
                          typeof initialValues
                        >({}, initialValues);
                        if (target) {
                          const key = `${target}${
                            target === 'surge' && ver ? `&ver=${ver}` : ''
                          }`;
                          console.log('key', key);
                          if ((targetEnum as any)[key]) fields.target = key;
                        }
                        if (url) {
                          fields.url = decodeURIComponent(
                            url.replace(/\|/g, '\n'),
                          );
                        }
                        if (
                          config &&
                          (configOptions as any).find(
                            (ele: any) =>
                              ele.value === config ||
                              !!ele.options?.find(
                                (e: any) => e.value === config,
                              ),
                          )
                        ) {
                          fields.config = config;
                        }
                        ['include', 'exclude', 'filename'].forEach((ele) => {
                          if (params[ele]) fields[ele] = params[ele];
                        });

                        [
                          'list',
                          'emoji',
                          'scv',
                          'sort',
                          'fdn',
                          'udp',
                          'expand',
                          'classic',
                        ].forEach((ele) => {
                          if (['emoji', 'fdn', 'expand'].includes(ele)) {
                            if (params[ele] === 'false')
                              fields.extra = fields.extra.filter(
                                (e) => e !== ele,
                              );
                          } else if (params[ele] === 'true')
                            fields.extra.push(ele);
                        });
                        if (others) fields.custom = qs(others);
                        fields.mode = 'advanced';

                        console.log('params', params, fields);
                        form.current?.setFieldsValue(fields);
                        return true;
                      }}
                    >
                      <ProFormTextArea
                        name="url"
                        rules={[{ required: true }]}
                        fieldProps={{
                          autoSize: { minRows: 3 },
                        }}
                      />
                    </ModalForm>
                  </Space>
                </Col>
              </Row>
            ),
            searchConfig: {
              resetText: '重置',
              submitText: '生成',
            },
          }}
        >
          <ProFormRadio.Group
            label="模式设置"
            valueEnum={{
              base: {
                text: '基础模式',
              },
              advanced: {
                text: '进阶模式',
              },
            }}
            name="mode"
          />
          <ProFormTextArea
            label="订阅链接"
            name="url"
            placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或用 | 分隔"
            rules={[{ required: true }]}
            fieldProps={{ autoSize: { minRows: 3 } }}
            transform={(value, namePath) => {
              if (!value) return {};
              return {
                [namePath]: encodeURIComponent(
                  value.replace(/(\n|\r|\n\r)/g, '|'),
                ),
              };
            }}
          />
          <ProFormSelect
            label="客户端"
            valueEnum={targetEnum}
            rules={[{ required: true }]}
            name="target"
          />
          <ProFormSelect
            label="远程配置"
            name="config"
            options={configOptions}
            extra={
              <>
                远程配置参阅
                <Link
                  href="https://github.com/ACL4SSR/ACL4SSR/tree/master/Clash/config"
                  target="_blank"
                >
                  链接
                  <PaperClipOutlined />
                </Link>
              </>
            }
            transform={(value, namePath) => {
              if (!value) return {};
              return {
                [namePath]: encodeURIComponent(value),
              };
            }}
          />
          <ProFormDependency name={['mode']}>
            {({ mode }) => {
              if (mode === 'base') return null;

              return (
                <>
                  <ProFormText
                    label="Include"
                    name="include"
                    placeholder="节点名包含的关键字，支持正则"
                    transform={(value, namePath) => {
                      if (!value) return {};
                      return {
                        [namePath]: encodeURIComponent(value),
                      };
                    }}
                  />
                  <ProFormText
                    label="Exclude"
                    name="exclude"
                    placeholder="节点名不包含的关键字，支持正则 例：官网|产品|平台|新网址"
                    transform={(value, namePath) => {
                      if (!value) return {};
                      return {
                        [namePath]: encodeURIComponent(value),
                      };
                    }}
                  />
                  <ProFormText
                    label="FileName"
                    name="filename"
                    placeholder="返回的订阅文件名"
                  />

                  <ConfigProvider
                    theme={{
                      components: {
                        Checkbox: {
                          lineHeight: 2,
                        },
                      },
                    }}
                  >
                    <ProFormCheckbox.Group
                      label="额外参数"
                      name="extra"
                      layout="vertical"
                      transform={(value = []) => {
                        const params = value.reduce(
                          (prev: Record<string, string>, current: string) => {
                            prev[current] = 'true';
                            return prev;
                          },
                          {},
                        );
                        initialValues.extra.forEach((ele) => {
                          if (!value.includes(ele)) params[ele] = 'false';
                        });
                        console.log(
                          '额外参数 value',
                          params,
                          initialValues.extra,
                        );
                        return params;
                      }}
                      valueEnum={{
                        list: {
                          text: 'list: 是否只输出节点订阅，默认为 false',
                        },
                        emoji: {
                          text: 'emoji: 用于设置节点名称是否包含 Emoji，默认为 true',
                        },
                        scv: {
                          text: 'scv: 用于关闭 TLS 节点的证书检查，默认为 false',
                        },
                        sort: {
                          text: 'sort: 用于对输出的节点或策略组按节点名进行再次排序，默认为 false',
                        },
                        fdn: {
                          text: 'fdn: 用于过滤目标类型不支持的节点，默认为 true',
                        },
                        udp: {
                          text: 'udp: 用于开启该订阅链接的 UDP，默认为 false',
                        },
                        expand: {
                          text: 'expand: 将规则全文写进订阅，默认为 true',
                        },
                        classic: {
                          text: 'classic: 是否生成 classical rule-provider，expand=false时生效',
                        },
                      }}
                    />
                  </ConfigProvider>

                  <ProFormText
                    label="自定义参数"
                    name="custom"
                    placeholder="例：a=1&b=2"
                    transform={(value = '') => {
                      if (!value) return {};
                      const params = Object.fromEntries(
                        new URLSearchParams(value),
                      );
                      return params;
                    }}
                  />
                </>
              );
            }}
          </ProFormDependency>
        </ProForm>
        <Divider>
          <SmileOutlined />
        </Divider>
        <Descriptions
          items={[
            {
              key: 1,
              label: '订阅地址',
              children: handleUrl ? (
                <Paragraph copyable>{handleUrl}</Paragraph>
              ) : (
                ''
              ),
            },
          ]}
        />
      </ProCard>
    </div>
  );
}
