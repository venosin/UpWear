'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { settingsService } from '@/services/SettingsService';
import { couponsService } from '@/services/CouponsService';
import { inventoryService } from '@/services/inventoryService';
import { analyticsService } from '@/services/analyticsService';

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

export default function MCPValidationPage() {
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const runMCPValidation = async () => {
    setIsValidating(true);
    try {
      console.log('🔍 Starting MCP Validation...');

      // Validar Settings con MCP
      console.log('📋 Validating Settings...');
      const settingsValidation = await settingsService.validateSettingsWithMCP();

      // Validar Coupons con MCP
      console.log('🎫 Validating Coupons...');
      const couponsValidation = await couponsService.validateCouponsWithMCP();

      // Validar Inventory con MCP
      console.log('📦 Validating Inventory...');
      const inventoryValidation = await inventoryService.validateInventoryWithMCP();

      // Validar Analytics con MCP
      console.log('📊 Validating Analytics...');
      const analyticsValidation = await analyticsService.validateAnalyticsTablesWithMCP();

      // Agregar validación de Analytics methods adicionales
      const analyticsCleanup = await analyticsService.cleanupOldEvents(90);

      const allErrors = [
        ...settingsValidation.errors,
        ...couponsValidation.errors,
        ...inventoryValidation.errors,
        ...analyticsValidation.errors
      ];

      const allWarnings = [
        ...inventoryValidation.inconsistencies.map((i: any) => `Inventory inconsistency for variant ${i.variant_id}: stock ${i.variant_stock} vs calculated ${i.calculated_stock}`),
        ...couponsValidation.issues.map((i: any) => `Coupon ${i.coupon_id}: ${i.issue} (${i.severity})`),
        ...(analyticsValidation.warnings || [])
      ];

      const results: ValidationResults = {
        settings: settingsValidation,
        coupons: couponsValidation,
        inventory: inventoryValidation,
        analytics: analyticsValidation,
        overall: {
          valid: allErrors.length === 0,
          errors: allErrors,
          warnings: allWarnings,
          timestamp: new Date().toISOString()
        }
      };

      setValidationResults(results);

      // Log validation results
      await analyticsService.trackEvent('mcp_validation', {
        success: results.overall.valid,
        errors_count: allErrors.length,
        warnings_count: allWarnings.length,
        settings_valid: settingsValidation.valid,
        coupons_valid: couponsValidation.valid,
        inventory_valid: inventoryValidation.valid,
        analytics_valid: analyticsValidation.valid
      });

      console.log('✅ MCP Validation Complete:', results);
    } catch (error) {
      console.error('❌ MCP Validation Error:', error);
      setValidationResults({
        settings: { valid: false, errors: [String(error)], missing_settings: [] },
        coupons: { valid: false, errors: [String(error)], issues: [] },
        inventory: { valid: false, errors: [String(error)], inconsistencies: [] },
        analytics: { valid: false, errors: [String(error)], warnings: [] },
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

  const getValidationColor = (valid: boolean) => {
    return valid ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 MCP System Validation</h1>
        <p className="text-gray-600">
          Complete validation of UpWear system using MCP (Model Context Protocol) to verify tables, fields, and data consistency.
        </p>
      </div>

      <div className="mb-6">
        <Button
          color="primary"
          size="lg"
          onClick={runMCPValidation}
          isLoading={isValidating}
          className="w-full md:w-auto"
        >
          {isValidating ? 'Running MCP Validation...' : '🚀 Run MCP Validation'}
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

          {/* Service Validations */}
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
                <div>✅ Tables: {validationResults.settings.valid ? 'OK' : 'Missing'}</div>
                {validationResults.settings.missing_settings?.length > 0 && (
                  <div className="text-yellow-600">
                    Missing settings: {validationResults.settings.missing_settings.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Coupons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                🎫 Coupons Service
                <span className={`ml-2 text-sm ${getValidationColor(validationResults.coupons.valid)}`}>
                  {validationResults.coupons.valid ? '✅' : '❌'}
                </span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>✅ Tables: {validationResults.coupons.valid ? 'OK' : 'Missing'}</div>
                {validationResults.coupons.issues?.length > 0 && (
                  <div className="text-yellow-600">
                    Issues: {validationResults.coupons.issues.length}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                📦 Inventory Service
                <span className={`ml-2 text-sm ${getValidationColor(validationResults.inventory.valid)}`}>
                  {validationResults.inventory.valid ? '✅' : '❌'}
                </span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>✅ Tables: {validationResults.inventory.valid ? 'OK' : 'Missing'}</div>
                {validationResults.inventory.inconsistencies?.length > 0 && (
                  <div className="text-yellow-600">
                    Inconsistencies: {validationResults.inventory.inconsistencies.length}
                  </div>
                )}
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                📊 Analytics Service
                <span className={`ml-2 text-sm ${getValidationColor(validationResults.analytics.valid)}`}>
                  {validationResults.analytics.valid ? '✅' : '❌'}
                </span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>✅ Tables: {validationResults.analytics.valid ? 'OK' : 'Missing'}</div>
                {validationResults.analytics.warnings?.length > 0 && (
                  <div className="text-yellow-600">
                    Warnings: {validationResults.analytics.warnings.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Errors and Warnings */}
          {(validationResults.overall.errors.length > 0 || validationResults.overall.warnings.length > 0) && (
            <div className="space-y-4">
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
            </div>
          )}

          {/* Table Info */}
          {validationResults.analytics.tableInfo && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-3">🗃️ Table Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {Object.entries(validationResults.analytics.tableInfo).map(([table, info]: [string, any]) => (
                  <div key={table} className="flex items-center space-x-2">
                    <span className={info.exists ? 'text-green-600' : 'text-red-600'}>
                      {info.exists ? '✅' : '❌'}
                    </span>
                    <span>{table}</span>
                    {info.exists && (
                      <span className="text-gray-500 text-xs">({info.columns?.length || 0} cols)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}