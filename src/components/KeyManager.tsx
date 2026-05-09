import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FiKey, FiPlus, FiTrash2, FiDownload,
  FiShield, FiCheck, FiAlertCircle,
  FiClock, FiLock, FiCopy, FiEye, FiEyeOff
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface KeyFormData {
  alias: string;
  storePassword: string;
  keyPassword: string;
  keyPasswordConfirm: string;
  dname: string;
  validity: number;
  keySize: number;
  algorithm: string;
}

interface SigningKey {
  id: string;
  alias: string;
  path: string;
  createdAt: Date;
  validUntil: Date;
  keySize: number;
  algorithm: string;
  fingerprint?: string;
  subject?: string;
}

interface KeyManagerProps {
  isMobile?: boolean;
}

const KeyManager: React.FC<KeyManagerProps> = ({ isMobile = false }) => {
  const { signingKeys, addSigningKey, removeSigningKey, selectedKey, setSelectedKey } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<KeyFormData>({
    alias: '',
    storePassword: '',
    keyPassword: '',
    keyPasswordConfirm: '',
    dname: 'CN=AI Compiler, OU=Development, O=AI Compiler Team, L=Beijing, ST=Beijing, C=CN',
    validity: 36500,
    keySize: 2048,
    algorithm: 'RSA'
  });

  const generateFingerprint = (): string => {
    const chars = 'ABCDEF0123456789';
    let fp = '';
    for (let i = 0; i < 40; i++) {
      if (i > 0 && i % 2 === 0) fp += ':';
      fp += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return fp;
  };

  const downloadFile = (content: string, filename: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateJKSFile = (key: SigningKey): string => {
    return `AI Compiler - Java KeyStore Simulation
=====================================
Alias: ${key.alias}
Algorithm: ${key.algorithm}
Key Size: ${key.keySize} bits
Created: ${key.createdAt.toISOString()}
Valid Until: ${key.validUntil.toISOString()}
Subject: ${key.subject}
Fingerprint: ${key.fingerprint}
=====================================
JKS File Format (Simulated)

This is a simulation of a Java KeyStore. For a real JKS, you would
need to use Java's keytool utility.

KeyStore Version: 2
Entry Type: PrivateKeyEntry
Creation Date: ${key.createdAt.toLocaleString()}
Entry Alias: ${key.alias}
Certificate Chain Length: 1

Certificate[1]:
  Owner: ${key.subject}
  Issuer: ${key.subject}
  Serial Number: ${Math.random().toString(16).substring(2)}
  Valid from: ${key.createdAt.toLocaleString()} to: ${key.validUntil.toLocaleString()}
  Certificate Fingerprint (SHA1): ${key.fingerprint}
  Signature Algorithm: SHA1with${key.algorithm}
  Version: 3
`;
  };

  const handleGenerateKey = () => {
    if (!formData.alias || !formData.storePassword || !formData.keyPassword) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (formData.keyPassword !== formData.keyPasswordConfirm) {
      toast.error('两次输入的密钥密码不一致');
      return;
    }

    if (formData.keyPassword.length < 6) {
      toast.error('密钥密码至少需要6个字符');
      return;
    }

    const fingerprint = generateFingerprint();
    const newKey: SigningKey = {
      id: uuidv4(),
      alias: formData.alias,
      path: `android://keystore/${formData.alias}.jks`,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + formData.validity * 24 * 60 * 60 * 1000),
      keySize: formData.keySize,
      algorithm: formData.algorithm,
      fingerprint,
      subject: formData.dname
    };

    addSigningKey(newKey);
    toast.success('✅ 签名密钥生成成功!');
    setShowForm(false);
    setFormData({
      alias: '',
      storePassword: '',
      keyPassword: '',
      keyPasswordConfirm: '',
      dname: 'CN=AI Compiler, OU=Development, O=AI Compiler Team, L=Beijing, ST=Beijing, C=CN',
      validity: 36500,
      keySize: 2048,
      algorithm: 'RSA'
    });
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm('⚠️ 警告：删除密钥将无法恢复！\n\n确定要删除此签名密钥吗？此操作不可撤销。')) {
      removeSigningKey(keyId);
      toast.success('密钥已删除');
    }
  };

  const handleExportKey = (key: SigningKey) => {
    const jksContent = generateJKSFile(key);
    downloadFile(jksContent, `${key.alias}-keystore.jks`, 'application/octet-stream');

    const keyData = {
      format: 'PKCS12',
      algorithm: key.algorithm,
      keySize: key.keySize,
      alias: key.alias,
      subject: key.subject,
      fingerprint: key.fingerprint,
      createdAt: key.createdAt.toISOString(),
      validUntil: key.validUntil.toISOString(),
      usage: 'APK Signing',
      note: 'This is a simulation. For real Android APK signing, use Java keytool.'
    };

    const jsonContent = JSON.stringify(keyData, null, 2);
    downloadFile(jsonContent, `${key.alias}-keystore-info.json`, 'application/json');

    toast.success('密钥文件已下载');
  };

  const handleCopyKeyInfo = (key: SigningKey) => {
    const info = `别名: ${key.alias}
算法: ${key.algorithm} ${key.keySize}-bit
指纹: ${key.fingerprint}
创建: ${key.createdAt.toLocaleString()}
有效期: ${key.validUntil.toLocaleString()}`;
    navigator.clipboard.writeText(info);
    toast.success('密钥信息已复制到剪贴板');
  };

  return (
    <div className={`h-full overflow-y-auto scrollbar-thin ${isMobile ? 'p-4' : ''}`}>
      <div className={`${isMobile ? '' : 'max-w-6xl mx-auto p-8'}`}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`font-bold flex items-center space-x-3 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                <FiShield className="text-ai-cyan" />
                <span>签名密钥管理</span>
              </h1>
              <p className="text-gray-400 mt-2 text-sm">
                生成和管理应用签名密钥，确保 Android 应用安全性
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className={`bg-gradient-to-r from-ai-purple to-ai-cyan rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2 ${
                isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
            >
              <FiPlus size={isMobile ? 16 : 18} />
              <span>生成密钥</span>
            </button>
          </div>

          <div className="gradient-border p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="text-yellow-500 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="text-yellow-200 font-medium">重要提示</p>
                <p className="text-gray-300 mt-1">
                  签名密钥用于对 APK 应用进行数字签名，确保应用来源可信。
                  <strong className="text-yellow-400"> 请务必妥善保管密钥配置，丢失将无法更新应用！</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="gradient-border p-6 rounded-xl mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <FiLock size={20} />
              <span>生成新签名密钥</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    密钥别名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    placeholder="例如: my-release-key"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    签名算法
                  </label>
                  <select
                    value={formData.algorithm}
                    onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                  >
                    <option value="RSA">RSA (推荐)</option>
                    <option value="DSA">DSA</option>
                    <option value="EC">ECDSA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    密钥长度
                  </label>
                  <select
                    value={formData.keySize}
                    onChange={(e) => setFormData({ ...formData, keySize: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                  >
                    <option value="2048">2048-bit (标准)</option>
                    <option value="4096">4096-bit (更安全)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    有效期 (天)
                  </label>
                  <input
                    type="number"
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  签名者信息 (DN)
                </label>
                <input
                  type="text"
                  value={formData.dname}
                  onChange={(e) => setFormData({ ...formData, dname: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div className="border-t border-slate-700 pt-4 mt-4">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <FiLock size={18} />
                  <span>密码设置</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      密钥库密码 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.storePassword}
                        onChange={(e) => setFormData({ ...formData, storePassword: e.target.value })}
                        placeholder="输入密钥库密码"
                        className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      密钥密码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.keyPassword}
                      onChange={(e) => setFormData({ ...formData, keyPassword: e.target.value })}
                      placeholder="输入密钥密码"
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      确认密钥密码 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.keyPasswordConfirm}
                      onChange={(e) => setFormData({ ...formData, keyPasswordConfirm: e.target.value })}
                      placeholder="再次输入密钥密码"
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleGenerateKey}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <FiKey size={18} />
                <span>生成签名密钥</span>
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {signingKeys.length === 0 ? (
            <div className="text-center py-16 gradient-border rounded-xl">
              <FiKey size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">暂无签名密钥</p>
              <p className="text-gray-500 text-sm mb-4">点击上方按钮生成您的第一个签名密钥</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                开始生成
              </button>
            </div>
          ) : (
            signingKeys.map((key) => (
              <div
                key={key.id}
                className={`gradient-border p-4 rounded-xl transition-all ${
                  selectedKey?.id === key.id ? 'ring-2 ring-primary-500' : ''
                } ${isMobile ? 'p-4' : 'p-6'}`}
                onClick={() => setSelectedKey(key)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-ai-purple/20 rounded-lg">
                      <FiKey size={24} className="text-ai-purple" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{key.alias}</h3>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
                          有效
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {key.algorithm} {key.keySize}-bit
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiClock size={12} />
                          <span>创建: {key.createdAt.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FiLock size={12} />
                          <span>有效期至: {key.validUntil.toLocaleString()}</span>
                        </span>
                      </div>

                      {key.fingerprint && (
                        <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs font-mono text-gray-400 break-all">
                          指纹: {key.fingerprint}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyKeyInfo(key); }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="复制密钥信息"
                    >
                      <FiCopy size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleExportKey(key); }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title="导出密钥"
                    >
                      <FiDownload size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteKey(key.id); }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="删除密钥"
                    >
                      <FiTrash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>

                {selectedKey?.id === key.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">算法</p>
                        <p className="font-mono">{key.algorithm}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">密钥长度</p>
                        <p className="font-mono">{key.keySize}-bit</p>
                      </div>
                      <div>
                        <p className="text-gray-400">格式</p>
                        <p className="font-mono">JKS / PKCS12</p>
                      </div>
                      <div>
                        <p className="text-gray-400">状态</p>
                        <p className="flex items-center space-x-1 text-green-400">
                          <FiCheck size={14} />
                          <span>有效</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyManager;
