import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import {
  FiKey, FiPlus, FiTrash2, FiDownload,
  FiShield, FiCheck, FiAlertCircle,
  FiClock, FiLock, FiCopy
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface KeyFormData {
  alias: string;
  storePassword: string;
  keyPassword: string;
  dname: string;
  validity: number;
}

const KeyManager: React.FC = () => {
  const { signingKeys, addSigningKey, removeSigningKey, selectedKey, setSelectedKey } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<KeyFormData>({
    alias: '',
    storePassword: '',
    keyPassword: '',
    dname: 'CN=AI Compiler, OU=Development, O=AI Compiler Team, L=Beijing, ST=Beijing, C=CN',
    validity: 36500
  });

  const handleGenerateKey = () => {
    if (!formData.alias || !formData.storePassword || !formData.keyPassword) {
      toast.error('请填写所有必填字段');
      return;
    }

    const newKey = {
      id: uuidv4(),
      alias: formData.alias,
      path: `Generated locally`,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + formData.validity * 24 * 60 * 60 * 1000)
    };

    addSigningKey(newKey);
    toast.success('签名密钥生成成功!');
    setShowForm(false);
    setFormData({
      alias: '',
      storePassword: '',
      keyPassword: '',
      dname: 'CN=AI Compiler, OU=Development, O=AI Compiler Team, L=Beijing, ST=Beijing, C=CN',
      validity: 36500
    });
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm('确定要删除此密钥吗? 此操作不可撤销。')) {
      removeSigningKey(keyId);
      toast.success('密钥已删除');
    }
  };

  const handleExportKey = (key: any) => {
    const keyData = JSON.stringify({
      alias: key.alias,
      createdAt: key.createdAt,
      validUntil: key.validUntil,
      dname: formData.dname
    }, null, 2);

    const blob = new Blob([keyData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${key.alias}-key-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('密钥配置已导出');
  };

  const handleCopyKeyInfo = (key: any) => {
    const info = `别名: ${key.alias}\n创建时间: ${key.createdAt.toLocaleString()}\n有效期至: ${key.validUntil.toLocaleString()}`;
    navigator.clipboard.writeText(info);
    toast.success('密钥信息已复制');
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center space-x-3">
                <FiShield className="text-ai-cyan" />
                <span>签名密钥管理</span>
              </h1>
              <p className="text-gray-400 mt-2">
                生成和管理应用签名密钥，确保应用安全性
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <FiPlus size={18} />
              <span>生成新密钥</span>
            </button>
          </div>

          <div className="gradient-border p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <FiAlertCircle className="text-ai-cyan mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-300">
                  签名密钥用于对应用进行数字签名，确保应用来源的可信性和完整性。
                  请妥善保管您的密钥配置信息，丢失将无法更新已发布的应用。
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-8 gradient-border p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">生成新签名密钥</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  密钥别名 *
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="my-key-alias"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  密钥库密码 *
                </label>
                <input
                  type="password"
                  value={formData.storePassword}
                  onChange={(e) => setFormData({ ...formData, storePassword: e.target.value })}
                  placeholder="输入密钥库密码"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  密钥密码 *
                </label>
                <input
                  type="password"
                  value={formData.keyPassword}
                  onChange={(e) => setFormData({ ...formData, keyPassword: e.target.value })}
                  placeholder="输入密钥密码"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  有效期 (天)
                </label>
                <input
                  type="number"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: parseInt(e.target.value) })}
                  placeholder="36500"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  签名者信息 (DN)
                </label>
                <input
                  type="text"
                  value={formData.dname}
                  onChange={(e) => setFormData({ ...formData, dname: e.target.value })}
                  placeholder="CN=Your Name, OU=Your Unit, O=Your Org, L=City, ST=State, C=Country"
                  className="w-full px-4 py-2 bg-slate-700 rounded-lg border border-slate-600 focus:border-primary-500 focus:outline-none text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleGenerateKey}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <FiKey size={18} />
                <span>生成密钥</span>
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
            <div className="text-center py-16">
              <FiKey size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-2">暂无签名密钥</p>
              <p className="text-gray-500 text-sm">点击上方按钮生成您的第一个签名密钥</p>
            </div>
          ) : (
            signingKeys.map((key) => (
              <div
                key={key.id}
                className={`gradient-border p-6 rounded-xl transition-all ${
                  selectedKey?.id === key.id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => setSelectedKey(key)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-ai-purple/20 rounded-lg">
                      <FiKey size={24} className="text-ai-purple" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-1">{key.alias}</h3>
                      <p className="text-sm text-gray-400 font-mono mb-2">
                        本地存储密钥配置
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FiClock size={12} />
                          <span>创建: {key.createdAt.toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FiLock size={12} />
                          <span>有效期至: {key.validUntil.toLocaleDateString()}</span>
                        </span>
                      </div>
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
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">算法</p>
                        <p className="font-mono">RSA 2048-bit</p>
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
