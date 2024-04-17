/**
 * @author: leroy
 * @date: 2024-04-16 11:51
 * @description：jetbra
 */
import { equal, pemEncodedCrt, pemEncodedKey } from '@/utils/jetbra';
import plugins from '@/utils/plugins.json';
import products from '@/utils/products.json';
import { CheckOutlined, CopyOutlined, DownOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { useDebounce } from 'ahooks';
import {
  Button,
  Collapse,
  ConfigProvider,
  FloatButton,
  Input,
  message,
  theme,
  Typography,
} from 'antd';
import copyToClipboard from 'copy-to-clipboard';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'umi';
import styles from './jetbra.less';

const defaultList = [...products, ...plugins];
const JetBrains = () => {
  const [list, setList] = useState(defaultList);
  const [openModal, setOpenModal] = useState(false);
  const [copyEqual, setCopyEqual] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, { wait: 200 });
  const form = useRef<ProFormInstance>();

  useEffect(() => {
    if (debouncedSearch) {
      const result = defaultList.filter(
        (item) => item.name.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1,
      );
      setList(result);
      return;
    }
    setList(defaultList);
  }, [debouncedSearch]);

  const checkLicense = () => {
    if (!localStorage.getItem('licenseInfo')) {
      setOpenModal(true);
      return false;
    }
    const licenseInfo = JSON.parse(localStorage.getItem('licenseInfo') || '');
    form.current?.setFieldsValue(licenseInfo);
    return true;
  };
  useEffect(() => {
    checkLicense();
  }, []);

  const pem2base64 = (pem: string) => {
    return pem
      .split('\n')
      .reduce((base64, line) => (line.includes('--') ? base64 : base64 + line), '');
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    return btoa([...new Uint8Array(buffer)].map((b) => String.fromCharCode(b)).join(''));
  };

  const base64ToArrayBuffer = (base64: string) => {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
  };

  const genLicenseId = () => {
    const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 10 }, () => {
      let idx = Math.floor(Math.random() * CHARSET.length);
      return CHARSET[idx];
    }).join('');
  };

  const buildLicensePartJson = ({
    products,
    licenseId,
    licenseeName,
    assigneeName,
  }: { products: Record<'code' | 'fallbackDate' | 'paidUpTo', string>[] } & Record<
    'licenseId' | 'licenseeName' | 'assigneeName',
    string
  >) => {
    return JSON.stringify({
      licenseId: licenseId,
      licenseeName: licenseeName,
      assigneeName: assigneeName,
      assigneeEmail: '',
      licenseRestriction: '',
      checkConcurrentUse: false,
      products: products,
      metadata: '0120230102PPAA013009',
      hash: '41472961/0:1563609451',
      gracePeriodDays: 7,
      autoProlongated: true,
      isAutoProlongated: true,
    });
  };
  const copyLicense = async (productCodes: string) => {
    if (!checkLicense()) return;
    let licenseInfo: { licenseeName: string; assigneeName: string; expiryDate: string } =
      JSON.parse(localStorage.getItem('licenseInfo')!);
    let codes = productCodes.split(',');
    let products = Array.from(codes).map((code) => {
      return {
        code: code,
        fallbackDate: licenseInfo.expiryDate,
        paidUpTo: licenseInfo.expiryDate,
      };
    });
    let licenseId = genLicenseId();
    let licensePartJson = buildLicensePartJson({
      products,
      licenseId,
      licenseeName: licenseInfo.licenseeName,
      assigneeName: licenseInfo.assigneeName,
    });

    let privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      base64ToArrayBuffer(pem2base64(pemEncodedKey)),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-1',
      },
      true,
      ['sign'],
    );

    let licensePartBase64 = btoa(decodeURIComponent(encodeURIComponent(licensePartJson)));
    let sigResultsBase64 = arrayBufferToBase64(
      await window.crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        privateKey,
        new TextEncoder().encode(licensePartJson),
      ),
    );
    let cert_base64 = pem2base64(pemEncodedCrt);

    copyToClipboard(`${licenseId}-${licensePartBase64}-${sigResultsBase64}-${cert_base64}`);
    message.success('The activation code has been copied to your clipboard');
  };

  return (
    <ConfigProvider
      theme={{
        // 1. 单独使用暗色算法
        algorithm: theme.darkAlgorithm,
      }}
    >
      <div className={styles.main}>
        <Helmet>
          <title>JetBrains Licensee</title>
        </Helmet>
        <ul className={styles.alert}>
          <Collapse
            bordered={false}
            ghost
            expandIconPosition="end"
            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
            items={[
              {
                key: '1',
                label: (
                  <li style={{ marginBottom: 0 }}>
                    <strong style={{ fontSize: 18 }}>Explanation</strong>
                  </li>
                ),
                children: (
                  <>
                    <li>
                      1. Add new parameters under ja-netfilter -&gt; power.conf -&gt; [Result]
                      <div className={styles.equal}>
                        <span className={styles.text}>{equal}</span>
                        <span className={styles.copy}>
                          {copyEqual ? (
                            <CheckOutlined className={styles.success} />
                          ) : (
                            <CopyOutlined
                              onClick={() => {
                                copyToClipboard(equal);
                                setCopyEqual(true);
                                setTimeout(() => {
                                  setCopyEqual(false);
                                }, 5000);
                              }}
                            />
                          )}
                        </span>
                      </div>
                    </li>
                    <li>
                      2. Or Download
                      <ConfigProvider
                        theme={{
                          components: {
                            Typography: {
                              colorLink: '#69b1ff',
                              colorLinkHover: '#69b1ff',
                              linkHoverDecoration: 'underline',
                            },
                          },
                        }}
                      >
                        <Typography.Link
                          download
                          href="/static/ja-netfilter.zip"
                          style={{ marginLeft: 8, fontSize: 16 }}
                        >
                          ja-netfilter.zip
                        </Typography.Link>
                      </ConfigProvider>
                    </li>
                  </>
                ),
              },
            ]}
          />
        </ul>

        <div className={styles.actions}>
          <strong>Search By Name</strong>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#d9d9d9',
              },
            }}
          >
            <Input
              style={{ width: 300, margin: '0 16px' }}
              placeholder=""
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </ConfigProvider>
          <span>
            <strong>IDE Tools: </strong> {products.length}，<strong>Plugin: </strong>
            {plugins.length}
          </span>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
            <ModalForm<{
              licenseeName: string;
              assigneeName: string;
              expiryDate: string;
            }>
              title="Create Licensee"
              formRef={form}
              trigger={
                <span>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#d9d9d9',
                      },
                    }}
                  >
                    <Button>Fill Licensee Info</Button>
                  </ConfigProvider>
                </span>
              }
              autoFocusFirstInput
              modalProps={{
                destroyOnClose: true,
                width: 400,
                centered: true,
              }}
              open={openModal}
              onOpenChange={setOpenModal}
              submitTimeout={2000}
              onFinish={async (values) => {
                console.log(values);
                localStorage.setItem('licenseInfo', JSON.stringify(values));
                return true;
              }}
              initialValues={{
                licenseeName: 'leroy',
                assigneeName: 'leroy20317',
                expiryDate: '2026-12-31',
              }}
            >
              <ProFormText name="licenseeName" label="licenseeName" />
              <ProFormText name="assigneeName" label="assigneeName" />
              <ProFormDatePicker
                name="expiryDate"
                label="expiryDate"
                fieldProps={{ style: { width: '100%' } }}
                convertValue={(value) => (value ? dayjs(value) : '')}
                transform={(value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')}
              />
            </ModalForm>
          </div>
        </div>
        <main className="px-6 z-grid">
          {list.map((product) => (
            <article key={product.id} className="card">
              <header>
                <div className="flex items-center justify-between px-6 pt-1 pb-0 bg-card radius-1">
                  <div className="avatar-wrapper flex items-center justify-center overflow-hidden shrink-0">
                    {/http(s)?:\/\//.test(product.icon) ? (
                      <div
                        className="icon"
                        role="img"
                        style={{ backgroundImage: `url('${product.icon}')` }}
                      ></div>
                    ) : (
                      <div className={`icon ${product.icon}`} role="img"></div>
                    )}
                  </div>

                  {product.link && (
                    <ConfigProvider
                      theme={{
                        token: {
                          colorPrimary: '#d9d9d9',
                        },
                      }}
                    >
                      <Button
                        className="link"
                        href={product.link}
                        target="_blank"
                        rel="noreferrer nofollow"
                      >
                        Desc
                      </Button>
                    </ConfigProvider>
                  )}
                </div>
                <hr />
              </header>
              <div className="pd-6 overflow-hidden bg-card container radius-1">
                <h1
                  className="truncate truncate-1 color-primary mt-0 overflow-ellipsis"
                  title={product.name}
                >
                  {product.name}
                </h1>
                <p
                  title="Click to copy full license text"
                  className="truncate text-sm text-grey"
                  onClick={() => copyLicense(product.code)}
                  data-content="Copy to clipboard"
                >
                  *********************************************************************************************************************************************************
                </p>
              </div>
              <div className="mask"></div>
              <div className="mask mask-c-1"></div>
            </article>
          ))}
        </main>
        <FloatButton.BackTop visibilityHeight={500} />
      </div>
    </ConfigProvider>
  );
};

export default JetBrains;
