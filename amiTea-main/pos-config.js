/**
 * amiTEA POS Configuration & Tax Registry
 * Supports Wisconsin municipal rates (Madison 5.5%, Milwaukee 7.9%) and Square setup.
 */

const AMI_CONFIG = {
  storeName: "amiTEA",
  tagline: "tea among friends",
  
  // Supported Locations & Taxes
  locations: {
    madison_wi: {
      id: "madison_wi",
      city: "Madison",
      county: "Dane",
      state: "WI",
      taxRate: 0.055, // 5.0% State + 0.5% Dane County
      label: "Madison, WI (Dane County · 5.5%)",
      address: "Madison, WI"
    },
    milwaukee_wi: {
      id: "milwaukee_wi",
      city: "Milwaukee",
      county: "Milwaukee",
      state: "WI",
      taxRate: 0.079, // 5.0% State + 0.9% County + 2.0% City
      label: "Milwaukee, WI (City of Milwaukee · 7.9%)",
      address: "Milwaukee, WI"
    }
  },

  defaultLocation: "madison_wi",

  // Square Payment Integration Settings
  square: {
    environment: "sandbox", // "sandbox" or "production"
    applicationId: "sq0idp-amiTeaSandboxAppId",
    locationId: "LQ8AMITEA_DEFAULT",
    currency: "USD",
    deviceTerminalId: "TERM-AMITEA-01",
    enableSimulation: true // True enables realistic interactive in-browser Square terminal reader simulation
  }
};

class StoreSettings {
  static getSettings() {
    const raw = localStorage.getItem("amitea_pos_settings");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse POS settings", e);
      }
    }
    const defLoc = AMI_CONFIG.locations[AMI_CONFIG.defaultLocation];
    const initial = {
      storeName: AMI_CONFIG.storeName,
      activeLocationId: defLoc.id,
      city: defLoc.city,
      state: defLoc.state,
      county: defLoc.county,
      taxRate: defLoc.taxRate,
      squareAppId: AMI_CONFIG.square.applicationId,
      squareLocationId: AMI_CONFIG.square.locationId,
      squareMode: AMI_CONFIG.square.environment,
      simulateSquare: true
    };
    localStorage.setItem("amitea_pos_settings", JSON.stringify(initial));
    return initial;
  }

  static setLocation(locationId) {
    const loc = AMI_CONFIG.locations[locationId] || AMI_CONFIG.locations[AMI_CONFIG.defaultLocation];
    const settings = this.getSettings();
    settings.activeLocationId = loc.id;
    settings.city = loc.city;
    settings.state = loc.state;
    settings.county = loc.county;
    settings.taxRate = loc.taxRate;
    localStorage.setItem("amitea_pos_settings", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("amitea:settings-changed", { detail: settings }));
    return settings;
  }

  static setCustomTax(city, state, taxRate) {
    const settings = this.getSettings();
    settings.activeLocationId = "custom";
    settings.city = city || "Custom";
    settings.state = state || "WI";
    settings.county = "Custom";
    settings.taxRate = parseFloat(taxRate) || 0.055;
    localStorage.setItem("amitea_pos_settings", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("amitea:settings-changed", { detail: settings }));
    return settings;
  }
}

window.AMI_CONFIG = AMI_CONFIG;
window.StoreSettings = StoreSettings;
