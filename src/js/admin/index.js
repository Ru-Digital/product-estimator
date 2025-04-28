/**
 * Main entry point for the Product Estimator plugin frontend
 */
import './CustomerEstimatesAdmin';
import './ProductEstimatorAdmin';
import './ProductEstimatorSettings';
import './modules/GeneralSettingsModule';
import './modules/NetsuiteSettingsModule';
import './modules/NotificationSettingsModule';
import './modules/ProductAdditionsSettingsModule';
import './modules/PricingRulesSettingsModule';
import './modules/SimilarProductsSettingsModule';
import './modules/ProductUpgradesSettingsModule';

// This is the main entry point for the frontend script bundle
// The admin modules are imported separately due to code splitting in webpack

console.log('Product Estimator initialized');

// Frontend functionality can be added here
