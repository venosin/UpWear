'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { settingsSafeService } from '@/services/SettingsSafeService';

interface ValidationResults {
  settings: any;
  coupons: any;
  inventory: any;
  analytics: any;
  overall: {
    valid: boolean;
    errors: string[];
    warnings: string[];
    timestamp: string;
  };
}

export default function SafeValidationPage() {
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runSafeValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Starting Safe MCP Validation...');

      // Validar Settings con método seguro
      console.log('⚙️ Validating Settings...');
      const settingsValidation = await settingsSafeService.validateSettingsWithMCP();

      // Validación directa de otras tablas con MCP
      const tablesValidation = await validateAllTables();

      const allErrors = [
        ...settingsValidation.errors,
        ...tablesValidation.errors
      ];

      const allWarnings = [
        ...tablesValidation.warnings || []
      ];

      const results: ValidationResults = {
        settings: settingsValidation,
        coupons: { valid: tablesValidation.coupons_exist },
        inventory: { valid: tablesValidation.inventory_logs_exist },
        analytics: { valid: tablesValidation.analytics_events_exist },
        overall: {
          valid: allErrors.length === 0,
          errors: allErrors,
          warnings: allWarnings,
          timestamp: new Date().toISOString()
        }
      };

      setValidationResults(results);

      console.log('✅ Safe MCP Validation Complete:', results);
    } catch (error) {
      console.error('❌ Safe MCP Validation Error:', error);
      setValidationResults({
        settings: { valid: false, errors: [String(error)], table_info: null },
        coupons: { valid: false },
        inventory: { valid: false },
        analytics: { valid: false },
        overall: {
          valid: false,
          errors: [String(error)],
          warnings: [],
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateAllTables = async () => {
    try {
      // Queries MCP directos para verificar tablas
      const response = await fetch('/api/validation/mcp-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_all_tables' })
      });

      return await response.json();
    } catch (error) {
      console.error('Error in validateAllTables:', error);
      return {
        coupons_exist: false,
        inventory_logs_exist: false,
        analytics_events_exist: false,
        admin_activity_logs_exist: false,
        errors: [String(error)],
        warnings: []
      };
    }
  };

  const getValidationColor = (valid: boolean) => {
    return valid ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Safe MCP Validation</h1>
        <p className="text-gray-600">
          Validación segura del sistema UpWear sin dependencias complejas.
        </p>
      </div>

      <div className="mb-6">
        <Button
          color="primary"
          size="lg"
          onClick={runSafeValidation}
          isLoading={isValidating}
          className="w-full md:w-auto"
        >
          {isValidating ? 'Running Safe Validation...' : '🚀 Run Safe MCP Validation'}
        </Button>
      </div>

      {validationResults && (
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Overall Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className={`text-2xl font-bold ${getValidationColor(validationResults.overall.valid)}`}>
                  {validationResults.overall.valid ? '✅ PASSED' : '❌ FAILED'}
                </div>
                <div className="text-sm text-gray-600">System Status</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {validationResults.overall.errors.length}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResults.overall.warnings.length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Validation completed: {new Date(validationResults.overall.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Component Validations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                ⚙️ Settings Service
                <span className={`ml-2 text-sm ${getValidationColor(validationResults.settings.valid)}`}>
                  {validationResults.settings.valid ? '✅' : '❌'}
                </span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>Table: {validationResults.settings.table_info?.table_exists ? '✅' : '❌'}</div>
                <div>Columns: {validationResults.settings.table_info?.columns_exist ? '✅' : '❌'}</div>
                <div>Public Settings: {validationResults.settings.table_info?.public_settings || 0}</div>
                <div>Essential Settings: {validationResults.settings.table_info?.essential_settings || 0}</div>
              </div>
            </div>

            {/* Other Tables */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3">🗄️ Database Tables</h3>
              <div className="space-y-2 text-sm">
                <div>Coupons: {validationResults.coupons.valid ? '✅' : '❌'}</div>
                <div>Inventory Logs: {validationResults.inventory.valid ? '✅' : '❌'}</div>
                <div>Analytics Events: {validationResults.analytics.valid ? '✅' : '❌'}</div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {validationResults.overall.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Errors</h3>
              <ul className="space-y-1">
                {validationResults.overall.errors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResults.overall.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Warnings</h3>
              <ul className="space-y-1">
                {validationResults.overall.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Settings Details */}
          {validationResults.settings.table_info && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3">⚙️ Settings Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Table Exists: {validationResults.settings.table_info.table_exists ? '✅' : '❌'}</div>
                <div>Columns Valid: {validationResults.settings.table_info.columns_exist ? '✅' : '❌'}</div>
                <div>Public Settings: {validationResults.settings.table_info.public_settings}</div>
                <div>Essential Settings: {validationResults.settings.table_info.essential_settings}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}