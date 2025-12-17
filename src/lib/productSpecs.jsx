export const PRODUCT_SPECS = [
  {
    categoryName: "Phones & Tablets",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "screen_size",
        label: "Screen Size",
        type: "number",
        unit: "inches",
      },
    ],
    advancedSpecs: [
      {
        key: "battery_capacity",
        label: "Battery Capacity",
        type: "number",
        unit: "mAh",
      },
      {
        key: "storage_capacity",
        label: "Storage Capacity",
        type: "number",
        unit: "GB",
      },
      { key: "ram", label: "RAM", type: "number", unit: "GB" },
      {
        key: "operating_system",
        label: "Operating System",
        type: "select",
        unit: null,
        options: ["Android", "iOS", "Other"],
      },
      {
        key: "camera_resolution_rear",
        label: "Rear Camera Resolution",
        type: "number",
        unit: "MP",
      },
      {
        key: "camera_resolution_front",
        label: "Front Camera Resolution",
        type: "number",
        unit: "MP",
      },
    ],
  },
  {
    categoryName: "Computers & Laptops",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "screen_size",
        label: "Screen Size",
        type: "number",
        unit: "inches",
      },
    ],
    advancedSpecs: [
      {
        key: "processor_type",
        label: "Processor Type",
        type: "string",
        unit: null,
      },
      { key: "ram", label: "RAM", type: "number", unit: "GB" },
      {
        key: "storage_capacity",
        label: "Storage Capacity",
        type: "number",
        unit: "GB",
      },
      {
        key: "operating_system",
        label: "Operating System",
        type: "select",
        unit: null,
        options: ["Windows", "macOS", "Linux", "Other"],
      },
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "hours",
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
  },
  {
    categoryName: "Televisions & Displays",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "screen_size",
        label: "Screen Size",
        type: "number",
        unit: "inches",
      },
    ],
    advancedSpecs: [
      {
        key: "resolution",
        label: "Resolution",
        type: "select",
        unit: null,
        options: ["HD", "Full HD", "4K", "8K"],
      },
      {
        key: "display_type",
        label: "Display Type",
        type: "select",
        unit: null,
        options: ["LED", "OLED", "QLED", "LCD"],
      },
      {
        key: "refresh_rate",
        label: "Refresh Rate",
        type: "number",
        unit: "Hz",
      },
      { key: "smart_tv", label: "Smart TV", type: "boolean", unit: null },
      { key: "ports_hdmi", label: "HDMI Ports", type: "number", unit: null },
      {
        key: "energy_consumption",
        label: "Energy Consumption",
        type: "number",
        unit: "W",
      },
    ],
  },
  {
    categoryName: "Cameras & Photography",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["DSLR", "Mirrorless", "Point-and-Shoot", "Action Camera"],
      },
    ],
    advancedSpecs: [
      {
        key: "sensor_resolution",
        label: "Sensor Resolution",
        type: "number",
        unit: "MP",
      },
      { key: "lens_mount", label: "Lens Mount", type: "string", unit: null },
      {
        key: "video_resolution",
        label: "Video Resolution",
        type: "select",
        unit: null,
        options: ["HD", "Full HD", "4K", "8K"],
      },
      {
        key: "battery_capacity",
        label: "Battery Capacity",
        type: "number",
        unit: "mAh",
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "waterproof", label: "Waterproof", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Audio Equipment",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Headphones", "Speakers", "Soundbars", "Amplifiers"],
      },
    ],
    advancedSpecs: [
      { key: "power_output", label: "Power Output", type: "number", unit: "W" },
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        unit: null,
        options: ["Bluetooth", "Wired", "Wi-Fi"],
      },
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "hours",
      },
      {
        key: "frequency_response",
        label: "Frequency Response",
        type: "string",
        unit: "Hz",
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "water_resistant",
        label: "Water Resistant",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Wearables",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Smartwatch", "Fitness Tracker", "Smart Glasses"],
      },
    ],
    advancedSpecs: [
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "hours",
      },
      {
        key: "display_size",
        label: "Display Size",
        type: "number",
        unit: "inches",
      },
      {
        key: "water_resistance_depth",
        label: "Water Resistance Depth",
        type: "number",
        unit: "m",
      },
      {
        key: "heart_rate_monitor",
        label: "Heart Rate Monitor",
        type: "boolean",
        unit: null,
      },
      { key: "gps_enabled", label: "GPS Enabled", type: "boolean", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Smart Home Devices",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: [
          "Smart Bulb",
          "Smart Lock",
          "Smart Thermostat",
          "Smart Camera",
        ],
      },
    ],
    advancedSpecs: [
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        unit: null,
        options: ["Wi-Fi", "Bluetooth", "Zigbee"],
      },
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Battery", "Wired", "Solar"],
      },
      {
        key: "voice_assistant_compatible",
        label: "Voice Assistant Compatible",
        type: "select",
        unit: null,
        options: ["Alexa", "Google Assistant", "Siri"],
      },
      {
        key: "energy_consumption",
        label: "Energy Consumption",
        type: "number",
        unit: "W",
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Networking Devices",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Router", "Switch", "Modem", "Access Point"],
      },
    ],
    advancedSpecs: [
      { key: "speed", label: "Speed", type: "number", unit: "Mbps" },
      {
        key: "frequency_band",
        label: "Frequency Band",
        type: "select",
        unit: null,
        options: ["2.4 GHz", "5 GHz", "Dual Band"],
      },
      {
        key: "ports_number",
        label: "Number of Ports",
        type: "number",
        unit: null,
      },
      { key: "range", label: "Range", type: "number", unit: "m" },
      {
        key: "security_protocol",
        label: "Security Protocol",
        type: "select",
        unit: null,
        options: ["WPA2", "WPA3"],
      },
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
    ],
  },
  {
    categoryName: "Electronics Accessories",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Cable", "Charger", "Case", "Adapter"],
      },
      {
        key: "compatibility",
        label: "Compatibility",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      { key: "length", label: "Length", type: "number", unit: "m" },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
      { key: "current", label: "Current", type: "number", unit: "A" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Office Electronics",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Printer", "Scanner", "Projector", "Shredder"],
      },
    ],
    advancedSpecs: [
      { key: "print_speed", label: "Print Speed", type: "number", unit: "ppm" },
      { key: "resolution", label: "Resolution", type: "number", unit: "dpi" },
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        unit: null,
        options: ["USB", "Wi-Fi", "Ethernet"],
      },
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
  },
  {
    categoryName: "Gaming Electronics",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Console", "Controller", "Headset", "Monitor"],
      },
    ],
    advancedSpecs: [
      {
        key: "storage_capacity",
        label: "Storage Capacity",
        type: "number",
        unit: "GB",
      },
      {
        key: "resolution_support",
        label: "Resolution Support",
        type: "select",
        unit: null,
        options: ["Full HD", "4K", "8K"],
      },
      {
        key: "connectivity",
        label: "Connectivity",
        type: "select",
        unit: null,
        options: ["Bluetooth", "Wired", "Wi-Fi"],
      },
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "hours",
      },
      {
        key: "refresh_rate",
        label: "Refresh Rate",
        type: "number",
        unit: "Hz",
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
  },
  {
    categoryName: "Men’s Clothing",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "size",
        label: "Size",
        type: "select",
        unit: null,
        options: ["S", "M", "L", "XL", "XXL"],
      },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "style",
        label: "Style",
        type: "select",
        unit: null,
        options: ["Casual", "Formal", "Sporty"],
      },
      {
        key: "fit_type",
        label: "Fit Type",
        type: "select",
        unit: null,
        options: ["Slim", "Regular", "Loose"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      {
        key: "care_instructions",
        label: "Care Instructions",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Women’s Clothing",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "size",
        label: "Size",
        type: "select",
        unit: null,
        options: ["XS", "S", "M", "L", "XL"],
      },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "style",
        label: "Style",
        type: "select",
        unit: null,
        options: ["Casual", "Formal", "Ethnic"],
      },
      {
        key: "fit_type",
        label: "Fit Type",
        type: "select",
        unit: null,
        options: ["Slim", "Regular", "A-Line"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      {
        key: "care_instructions",
        label: "Care Instructions",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Kids Clothing",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "age_group", label: "Age Group", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "size",
        label: "Size",
        type: "select",
        unit: null,
        options: ["2-4 Years", "5-7 Years", "8-10 Years"],
      },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        unit: null,
        options: ["Boy", "Girl", "Unisex"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      {
        key: "care_instructions",
        label: "Care Instructions",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Footwear",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "number", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Sneakers", "Boots", "Sandals", "Formal Shoes"],
      },
      {
        key: "sole_material",
        label: "Sole Material",
        type: "string",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      {
        key: "water_resistant",
        label: "Water Resistant",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Bags & Luggage",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Backpack", "Suitcase", "Handbag", "Duffel"],
      },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "wheels", label: "Wheels", type: "boolean", unit: null },
      { key: "waterproof", label: "Waterproof", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Jewelry",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Necklace", "Ring", "Earrings", "Bracelet"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "purity", label: "Purity", type: "number", unit: "karat" },
      { key: "gemstone", label: "Gemstone", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Watches",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Analog", "Digital", "Smartwatch"],
      },
    ],
    advancedSpecs: [
      { key: "dial_color", label: "Dial Color", type: "string", unit: null },
      {
        key: "strap_material",
        label: "Strap Material",
        type: "string",
        unit: null,
      },
      {
        key: "water_resistance_depth",
        label: "Water Resistance Depth",
        type: "number",
        unit: "m",
      },
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "months",
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Eyewear",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Sunglasses", "Eyeglasses", "Contact Lenses"],
      },
      { key: "frame_color", label: "Frame Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "lens_material",
        label: "Lens Material",
        type: "string",
        unit: null,
      },
      {
        key: "uv_protection",
        label: "UV Protection",
        type: "boolean",
        unit: null,
      },
      {
        key: "frame_material",
        label: "Frame Material",
        type: "string",
        unit: null,
      },
      { key: "size", label: "Size", type: "string", unit: "mm" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Fashion Accessories",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Belt", "Hat", "Scarf", "Gloves"],
      },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        unit: null,
        options: ["Men", "Women", "Unisex"],
      },
    ],
  },
  {
    categoryName: "Fresh Produce",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "origin", label: "Origin", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "days" },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Loose", "Packaged", "Bunched"],
      },
      {
        key: "calories_per_100g",
        label: "Calories per 100g",
        type: "number",
        unit: "kcal",
      },
    ],
  },
  {
    categoryName: "Meat & Seafood",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "origin", label: "Origin", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "cut_type", label: "Cut Type", type: "string", unit: null },
      {
        key: "fresh_or_frozen",
        label: "Fresh or Frozen",
        type: "select",
        unit: null,
        options: ["Fresh", "Frozen"],
      },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "days" },
      {
        key: "protein_per_100g",
        label: "Protein per 100g",
        type: "number",
        unit: "g",
      },
    ],
  },
  {
    categoryName: "Dairy & Eggs",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "fat_content", label: "Fat Content", type: "number", unit: "%" },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "days" },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bottle", "Carton", "Pack"],
      },
    ],
  },
  {
    categoryName: "Dry Foods & Grains",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bag", "Box", "Can"],
      },
      {
        key: "calories_per_100g",
        label: "Calories per 100g",
        type: "number",
        unit: "kcal",
      },
    ],
  },
  {
    categoryName: "Snacks",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "flavor", label: "Flavor", type: "string", unit: null },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "calories_per_serving",
        label: "Calories per Serving",
        type: "number",
        unit: "kcal",
      },
    ],
  },
  {
    categoryName: "Beverages (Alcohol-Free)",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "volume", label: "Volume", type: "number", unit: "L" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "flavor", label: "Flavor", type: "string", unit: null },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "calories_per_100ml",
        label: "Calories per 100ml",
        type: "number",
        unit: "kcal",
      },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bottle", "Can", "Carton"],
      },
    ],
  },
  {
    categoryName: "Alcoholic Drinks",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "volume", label: "Volume", type: "number", unit: "L" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "alcohol_content",
        label: "Alcohol Content",
        type: "number",
        unit: "%",
      },
      { key: "origin", label: "Origin", type: "string", unit: null },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "years" },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bottle", "Can"],
      },
    ],
  },
  {
    categoryName: "Frozen Foods",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bag", "Box"],
      },
      {
        key: "calories_per_100g",
        label: "Calories per 100g",
        type: "number",
        unit: "kcal",
      },
    ],
  },
  {
    categoryName: "Bakery & Pastry",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "flavor", label: "Flavor", type: "string", unit: null },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "days" },
      {
        key: "calories_per_100g",
        label: "Calories per 100g",
        type: "number",
        unit: "kcal",
      },
    ],
  },
  {
    categoryName: "Cooking Ingredients & Spices",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "packaging_type",
        label: "Packaging Type",
        type: "select",
        unit: null,
        options: ["Bottle", "Bag", "Jar"],
      },
      { key: "origin", label: "Origin", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Seeds",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "germination_rate",
        label: "Germination Rate",
        type: "number",
        unit: "%",
      },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      {
        key: "planting_season",
        label: "Planting Season",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Fertilizers",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Organic", "Chemical", "Liquid", "Granular"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "npk_ratio", label: "NPK Ratio", type: "string", unit: null },
      {
        key: "application_rate",
        label: "Application Rate",
        type: "number",
        unit: "kg/ha",
      },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "years" },
      { key: "target_crop", label: "Target Crop", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Farming Tools",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Manual", "Electric", "Battery"],
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Animal Feed",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "animal_type", label: "Animal Type", type: "string", unit: null },
      {
        key: "protein_content",
        label: "Protein Content",
        type: "number",
        unit: "%",
      },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Irrigation Equipment",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Drip", "Sprinkler", "Pump", "Hose"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "flow_rate", label: "Flow Rate", type: "number", unit: "L/h" },
      { key: "pressure", label: "Pressure", type: "number", unit: "bar" },
      {
        key: "coverage_area",
        label: "Coverage Area",
        type: "number",
        unit: "m²",
      },
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
    ],
  },
  {
    categoryName: "Pesticides",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Insecticide", "Herbicide", "Fungicide"],
      },
      { key: "volume", label: "Volume", type: "number", unit: "L" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "active_ingredient",
        label: "Active Ingredient",
        type: "string",
        unit: null,
      },
      {
        key: "application_rate",
        label: "Application Rate",
        type: "number",
        unit: "ml/ha",
      },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "years" },
      { key: "target_pest", label: "Target Pest", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Gardening Supplies",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Harvested Crops",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "origin", label: "Origin", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "harvest_date",
        label: "Harvest Date",
        type: "string",
        unit: null,
      },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "days" },
      {
        key: "grade",
        label: "Grade",
        type: "select",
        unit: null,
        options: ["A", "B", "C"],
      },
    ],
  },
  {
    categoryName: "Bricks & Blocks",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Clay Brick", "Concrete Block", "Fly Ash Brick"],
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "mm" },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "compressive_strength",
        label: "Compressive Strength",
        type: "number",
        unit: "MPa",
      },
      { key: "color", label: "Color", type: "string", unit: null },
      {
        key: "water_absorption",
        label: "Water Absorption",
        type: "number",
        unit: "%",
      },
    ],
  },
  {
    categoryName: "Cement & Concrete",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Portland Cement", "Ready-Mix Concrete"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "grade", label: "Grade", type: "string", unit: null },
      {
        key: "setting_time",
        label: "Setting Time",
        type: "number",
        unit: "hours",
      },
      {
        key: "compressive_strength",
        label: "Compressive Strength",
        type: "number",
        unit: "MPa",
      },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Sand & Gravel",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["River Sand", "Crushed Gravel", "Fine Sand"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "origin", label: "Origin", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "particle_size",
        label: "Particle Size",
        type: "number",
        unit: "mm",
      },
      {
        key: "moisture_content",
        label: "Moisture Content",
        type: "number",
        unit: "%",
      },
      { key: "density", label: "Density", type: "number", unit: "kg/m³" },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Roofing Materials",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Tiles", "Sheets", "Shingles"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "fire_rating", label: "Fire Rating", type: "string", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Plumbing Materials",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Pipes", "Fittings", "Valves"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "number", unit: "mm" },
    ],
    advancedSpecs: [
      {
        key: "pressure_rating",
        label: "Pressure Rating",
        type: "number",
        unit: "bar",
      },
      { key: "length", label: "Length", type: "number", unit: "m" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "corrosion_resistant",
        label: "Corrosion Resistant",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Electrical Supplies",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Wires", "Switches", "Sockets", "Circuit Breakers"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
    ],
    advancedSpecs: [
      {
        key: "current_rating",
        label: "Current Rating",
        type: "number",
        unit: "A",
      },
      { key: "length", label: "Length", type: "number", unit: "m" },
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Paints & Finishes",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Interior", "Exterior", "Enamel"],
      },
      { key: "volume", label: "Volume", type: "number", unit: "L" },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "finish",
        label: "Finish",
        type: "select",
        unit: null,
        options: ["Matte", "Glossy", "Satin"],
      },
      {
        key: "coverage_area",
        label: "Coverage Area",
        type: "number",
        unit: "m²/L",
      },
      {
        key: "drying_time",
        label: "Drying Time",
        type: "number",
        unit: "hours",
      },
    ],
  },
  {
    categoryName: "Doors & Windows",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Door", "Window"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "insulation_rating",
        label: "Insulation Rating",
        type: "string",
        unit: null,
      },
      { key: "lock_type", label: "Lock Type", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Tiles & Flooring",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Ceramic", "Porcelain", "Vinyl"],
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "thickness", label: "Thickness", type: "number", unit: "mm" },
      {
        key: "water_absorption",
        label: "Water Absorption",
        type: "number",
        unit: "%",
      },
      {
        key: "slip_resistance",
        label: "Slip Resistance",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Construction Tools",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Manual", "Electric"],
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Living Room Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Sofa", "Coffee Table", "TV Stand"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "assembly_required",
        label: "Assembly Required",
        type: "boolean",
        unit: null,
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Bedroom Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Bed", "Wardrobe", "Dresser"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "assembly_required",
        label: "Assembly Required",
        type: "boolean",
        unit: null,
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Office Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Desk", "Chair", "Bookshelf"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "adjustable", label: "Adjustable", type: "boolean", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Outdoor Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Chair", "Table", "Bench"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "weather_resistant",
        label: "Weather Resistant",
        type: "boolean",
        unit: null,
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Kitchen Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Cabinet", "Table", "Chair"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "assembly_required",
        label: "Assembly Required",
        type: "boolean",
        unit: null,
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Home Decor",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "style", label: "Style", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Storage & Organization",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Shelf", "Bin", "Drawer"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
    advancedSpecs: [
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "stackable", label: "Stackable", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Mattresses & Bedding",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Mattress", "Pillow", "Sheet"],
      },
      {
        key: "size",
        label: "Size",
        type: "select",
        unit: null,
        options: ["Single", "Double", "Queen", "King"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "thickness", label: "Thickness", type: "number", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "firmness",
        label: "Firmness",
        type: "select",
        unit: null,
        options: ["Soft", "Medium", "Firm"],
      },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Cars",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      { key: "year", label: "Year", type: "number", unit: null },
    ],
    advancedSpecs: [
      {
        key: "engine_capacity",
        label: "Engine Capacity",
        type: "number",
        unit: "cc",
      },
      {
        key: "fuel_type",
        label: "Fuel Type",
        type: "select",
        unit: null,
        options: ["Petrol", "Diesel", "Electric"],
      },
      { key: "mileage", label: "Mileage", type: "number", unit: "km/L" },
      {
        key: "seating_capacity",
        label: "Seating Capacity",
        type: "number",
        unit: null,
      },
      {
        key: "transmission_type",
        label: "Transmission Type",
        type: "select",
        unit: null,
        options: ["Manual", "Automatic"],
      },
    ],
  },
  {
    categoryName: "Motorcycles",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      { key: "year", label: "Year", type: "number", unit: null },
    ],
    advancedSpecs: [
      {
        key: "engine_capacity",
        label: "Engine Capacity",
        type: "number",
        unit: "cc",
      },
      {
        key: "fuel_type",
        label: "Fuel Type",
        type: "select",
        unit: null,
        options: ["Petrol", "Electric"],
      },
      { key: "mileage", label: "Mileage", type: "number", unit: "km/L" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "top_speed", label: "Top Speed", type: "number", unit: "km/h" },
    ],
  },
  {
    categoryName: "Scooters & Bicycles",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Scooter", "Bicycle", "Electric Scooter"],
      },
    ],
    advancedSpecs: [
      {
        key: "frame_material",
        label: "Frame Material",
        type: "string",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "battery_capacity",
        label: "Battery Capacity",
        type: "number",
        unit: "Ah",
      },
      { key: "range", label: "Range", type: "number", unit: "km" },
      { key: "gears", label: "Gears", type: "number", unit: null },
    ],
  },
  {
    categoryName: "Auto Spare Parts",
    basicSpecs: [
      { key: "part_type", label: "Part Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "compatibility",
        label: "Compatibility",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "warranty", label: "Warranty", type: "number", unit: "months" },
    ],
  },
  {
    categoryName: "Tires & Wheels",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["All-Season", "Winter", "Summer"],
      },
    ],
    advancedSpecs: [
      { key: "tread_depth", label: "Tread Depth", type: "number", unit: "mm" },
      { key: "load_index", label: "Load Index", type: "number", unit: null },
      {
        key: "speed_rating",
        label: "Speed Rating",
        type: "string",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
  },
  {
    categoryName: "Batteries",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "capacity", label: "Capacity", type: "number", unit: "Ah" },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
    ],
    advancedSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Lead-Acid", "Lithium-Ion"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Oils & Lubricants",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "volume", label: "Volume", type: "number", unit: "L" },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "viscosity", label: "Viscosity", type: "string", unit: null },
      { key: "api_rating", label: "API Rating", type: "string", unit: null },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "years" },
      { key: "synthetic", label: "Synthetic", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Vehicle Accessories",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "compatibility",
        label: "Compatibility",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
  },
  {
    categoryName: "Skin Care",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Cream", "Lotion", "Serum"],
      },
      { key: "volume", label: "Volume", type: "number", unit: "ml" },
    ],
    advancedSpecs: [
      {
        key: "skin_type",
        label: "Skin Type",
        type: "select",
        unit: null,
        options: ["Dry", "Oily", "Combination", "Sensitive"],
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "spf", label: "SPF", type: "number", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Hair Care",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Shampoo", "Conditioner", "Oil"],
      },
      { key: "volume", label: "Volume", type: "number", unit: "ml" },
    ],
    advancedSpecs: [
      {
        key: "hair_type",
        label: "Hair Type",
        type: "select",
        unit: null,
        options: ["Straight", "Curly", "Dry", "Oily"],
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "sulfate_free",
        label: "Sulfate Free",
        type: "boolean",
        unit: null,
      },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Personal Hygiene",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Soap", "Toothpaste", "Deodorant"],
      },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "scent", label: "Scent", type: "string", unit: null },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "hypoallergenic",
        label: "Hypoallergenic",
        type: "boolean",
        unit: null,
      },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Fragrances",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Perfume", "Cologne", "Body Spray"],
      },
      { key: "volume", label: "Volume", type: "number", unit: "ml" },
    ],
    advancedSpecs: [
      { key: "scent_notes", label: "Scent Notes", type: "string", unit: null },
      { key: "longevity", label: "Longevity", type: "number", unit: "hours" },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        unit: null,
        options: ["Men", "Women", "Unisex"],
      },
      { key: "shelf_life", label: "Shelf Life", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Makeup",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Lipstick", "Foundation", "Mascara"],
      },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "finish",
        label: "Finish",
        type: "select",
        unit: null,
        options: ["Matte", "Glossy", "Satin"],
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "waterproof", label: "Waterproof", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Beauty Tools",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Brush", "Mirror", "Curling Iron"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Battery", "Electric"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "warranty", label: "Warranty", type: "number", unit: "months" },
    ],
  },
  {
    categoryName: "Small Appliances",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Toaster", "Blender", "Coffee Maker"],
      },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Large Appliances",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Refrigerator", "Washing Machine", "Oven"],
      },
    ],
    advancedSpecs: [
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      {
        key: "energy_rating",
        label: "Energy Rating",
        type: "string",
        unit: null,
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Kitchen Appliances",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Microwave", "Dishwasher", "Food Processor"],
      },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Heating & Cooling Devices",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Fan", "Heater", "Air Conditioner"],
      },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "capacity", label: "Capacity", type: "number", unit: "BTU" },
      { key: "noise_level", label: "Noise Level", type: "number", unit: "dB" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Cleaning Appliances",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Vacuum Cleaner", "Steam Mop", "Robot Vacuum"],
      },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "capacity", label: "Capacity", type: "number", unit: "L" },
      {
        key: "battery_life",
        label: "Battery Life",
        type: "number",
        unit: "hours",
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Hand Tools",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "handle_type", label: "Handle Type", type: "string", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Power Tools",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Drill", "Saw", "Sander"],
      },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "W",
      },
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
      { key: "speed", label: "Speed", type: "number", unit: "RPM" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Industrial Machines",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      { key: "type", label: "Type", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "power_consumption",
        label: "Power Consumption",
        type: "number",
        unit: "kW",
      },
      { key: "capacity", label: "Capacity", type: "number", unit: "tons/h" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "m" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Safety Equipment",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Helmet", "Gloves", "Vest"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Hardware Supplies",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "size", label: "Size", type: "string", unit: "mm" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "finish", label: "Finish", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Measuring Tools",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Tape Measure", "Level", "Caliper"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "range", label: "Range", type: "number", unit: "m" },
    ],
    advancedSpecs: [
      { key: "accuracy", label: "Accuracy", type: "number", unit: "mm" },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "digital", label: "Digital", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "First Aid",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      {
        key: "expiration_date",
        label: "Expiration Date",
        type: "string",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
  },
  {
    categoryName: "Medical Equipment",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      { key: "type", label: "Type", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Battery", "Electric"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Supplements",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "dosage", label: "Dosage", type: "number", unit: "mg" },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "expiration_date",
        label: "Expiration Date",
        type: "string",
        unit: null,
      },
      {
        key: "form",
        label: "Form",
        type: "select",
        unit: null,
        options: ["Tablet", "Capsule", "Powder"],
      },
    ],
  },
  {
    categoryName: "Protective Equipment",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Mask", "Gloves", "Gown"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
      { key: "disposable", label: "Disposable", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Diagnostic Tools",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Thermometer", "Blood Pressure Monitor", "Glucometer"],
      },
    ],
    advancedSpecs: [
      { key: "accuracy", label: "Accuracy", type: "number", unit: "%" },
      {
        key: "power_source",
        label: "Power Source",
        type: "select",
        unit: null,
        options: ["Battery", "Electric"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Art Supplies",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
  },
  {
    categoryName: "School Supplies",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Office Stationery",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Craft Materials",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Books",
    basicSpecs: [
      { key: "title", label: "Title", type: "string", unit: null },
      { key: "author", label: "Author", type: "string", unit: null },
      { key: "genre", label: "Genre", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "pages", label: "Pages", type: "number", unit: null },
      { key: "isbn", label: "ISBN", type: "string", unit: null },
      {
        key: "format",
        label: "Format",
        type: "select",
        unit: null,
        options: ["Hardcover", "Paperback", "Ebook"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Sports Equipment",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "size", label: "Size", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "months" },
    ],
  },
  {
    categoryName: "Fitness Equipment",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Dumbbell", "Treadmill", "Yoga Mat"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "weight_capacity",
        label: "Weight Capacity",
        type: "number",
        unit: "kg",
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "adjustable", label: "Adjustable", type: "boolean", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Outdoor Gear",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "waterproof", label: "Waterproof", type: "boolean", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Cycles & Accessories",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Bicycle", "Helmet", "Lock"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "gears", label: "Gears", type: "number", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Camping Gear",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Tent", "Sleeping Bag", "Backpack"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "capacity", label: "Capacity", type: "number", unit: "persons" },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Baby Essentials",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Diapers", "Baby Wipes", "Formula", "Bottle", "Pacifier"],
      },
      { key: "age_range", label: "Age Range", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "quantity_per_pack",
        label: "Quantity per Pack",
        type: "number",
        unit: null,
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      {
        key: "hypoallergenic",
        label: "Hypoallergenic",
        type: "boolean",
        unit: null,
      },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Toys & Games",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "age_range", label: "Age Range", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      {
        key: "battery_required",
        label: "Battery Required",
        type: "boolean",
        unit: null,
      },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Kids Furniture",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Crib", "High Chair", "Changing Table", "Toy Chest"],
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      {
        key: "assembly_required",
        label: "Assembly Required",
        type: "boolean",
        unit: null,
      },
      {
        key: "safety_certified",
        label: "Safety Certified",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "School Items",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "grade_level", label: "Grade Level", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Pet Food",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "animal_type",
        label: "Animal Type",
        type: "select",
        unit: null,
        options: ["Dog", "Cat", "Bird", "Fish"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
    advancedSpecs: [
      {
        key: "life_stage",
        label: "Life Stage",
        type: "select",
        unit: null,
        options: ["Puppy/Kitten", "Adult", "Senior"],
      },
      { key: "organic", label: "Organic", type: "boolean", unit: null },
      { key: "grain_free", label: "Grain Free", type: "boolean", unit: null },
      {
        key: "shelf_life",
        label: "Shelf Life",
        type: "number",
        unit: "months",
      },
    ],
  },
  {
    categoryName: "Pet Accessories",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Collar", "Leash", "Bed", "Toy"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "animal_type",
        label: "Animal Type",
        type: "select",
        unit: null,
        options: ["Dog", "Cat", "Bird"],
      },
    ],
    advancedSpecs: [
      { key: "size", label: "Size", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "color", label: "Color", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Animal Medicine",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "type", label: "Type", type: "string", unit: null },
      {
        key: "animal_type",
        label: "Animal Type",
        type: "select",
        unit: null,
        options: ["Dog", "Cat", "Horse", "Bird"],
      },
    ],
    advancedSpecs: [
      {
        key: "dosage_form",
        label: "Dosage Form",
        type: "select",
        unit: null,
        options: ["Tablet", "Liquid", "Injection"],
      },
      {
        key: "active_ingredient",
        label: "Active Ingredient",
        type: "string",
        unit: null,
      },
      { key: "quantity", label: "Quantity", type: "number", unit: null },
      {
        key: "expiration_date",
        label: "Expiration Date",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Animal Equipment",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "animal_type", label: "Animal Type", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
    ],
  },
  {
    categoryName: "Gold Items",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Ring", "Necklace", "Bracelet", "Earrings"],
      },
      { key: "purity", label: "Purity", type: "number", unit: "karat" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
    advancedSpecs: [
      {
        key: "making_charges",
        label: "Making Charges",
        type: "number",
        unit: "per_gram",
      },
      { key: "gemstone", label: "Gemstone", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Silver Items",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Ring", "Chain", "Anklet", "Utensils"],
      },
      { key: "purity", label: "Purity", type: "number", unit: "%" },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
    advancedSpecs: [
      { key: "design", label: "Design", type: "string", unit: null },
      { key: "hallmark", label: "Hallmark", type: "boolean", unit: null },
    ],
  },
  {
    categoryName: "Precious Stones",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "carat" },
      { key: "color", label: "Color", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "cut", label: "Cut", type: "string", unit: null },
      { key: "clarity", label: "Clarity", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Jewelry Accessories",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Box", "Cleaner", "Polishing Cloth"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "dimensions", label: "Dimensions", type: "string", unit: "cm" },
    ],
  },
  {
    categoryName: "Gas & Fuel",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["LPG Cylinder", "Petrol", "Diesel", "CNG"],
      },
      {
        key: "volume_weight",
        label: "Volume/Weight",
        type: "number",
        unit: null,
      },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        unit: null,
        options: ["kg", "liters"],
      },
    ],
    advancedSpecs: [
      { key: "purity", label: "Purity", type: "number", unit: "%" },
      {
        key: "brand_supplier",
        label: "Brand/Supplier",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Solar Equipment",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Solar Panel", "Inverter", "Battery", "Charge Controller"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      {
        key: "capacity_power",
        label: "Capacity/Power",
        type: "number",
        unit: null,
      },
    ],
    advancedSpecs: [
      { key: "wattage", label: "Wattage", type: "number", unit: "W" },
      { key: "efficiency", label: "Efficiency", type: "number", unit: "%" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Generators",
    basicSpecs: [
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
      {
        key: "power_output",
        label: "Power Output",
        type: "number",
        unit: "kVA",
      },
    ],
    advancedSpecs: [
      {
        key: "fuel_type",
        label: "Fuel Type",
        type: "select",
        unit: null,
        options: ["Diesel", "Petrol", "Gas"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "noise_level", label: "Noise Level", type: "number", unit: "dB" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Electrical Components",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "rating", label: "Rating", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "voltage", label: "Voltage", type: "number", unit: "V" },
      { key: "current", label: "Current", type: "number", unit: "A" },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Repair Services",
    basicSpecs: [
      {
        key: "service_type",
        label: "Service Type",
        type: "string",
        unit: null,
      },
      {
        key: "provider_name",
        label: "Provider Name",
        type: "string",
        unit: null,
      },
      {
        key: "coverage_area",
        label: "Coverage Area",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      {
        key: "response_time",
        label: "Response Time",
        type: "number",
        unit: "hours",
      },
      {
        key: "warranty_on_service",
        label: "Warranty on Service",
        type: "number",
        unit: "months",
      },
      { key: "rating", label: "Average Rating", type: "number", unit: null },
    ],
  },
  {
    categoryName: "Delivery Services",
    basicSpecs: [
      {
        key: "service_type",
        label: "Service Type",
        type: "select",
        unit: null,
        options: ["Same-Day", "Next-Day", "Express", "Standard"],
      },
      {
        key: "provider_name",
        label: "Provider Name",
        type: "string",
        unit: null,
      },
      {
        key: "coverage_area",
        label: "Coverage Area",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      { key: "max_weight", label: "Max Weight", type: "number", unit: "kg" },
      {
        key: "tracking_available",
        label: "Tracking Available",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Cleaning Services",
    basicSpecs: [
      {
        key: "service_type",
        label: "Service Type",
        type: "select",
        unit: null,
        options: ["Home Cleaning", "Office Cleaning", "Carpet Cleaning"],
      },
      {
        key: "provider_name",
        label: "Provider Name",
        type: "string",
        unit: null,
      },
      {
        key: "coverage_area",
        label: "Coverage Area",
        type: "string",
        unit: null,
      },
    ],
    advancedSpecs: [
      {
        key: "eco_friendly",
        label: "Eco-Friendly",
        type: "boolean",
        unit: null,
      },
      {
        key: "minimum_hours",
        label: "Minimum Hours",
        type: "number",
        unit: "hours",
      },
    ],
  },
  {
    categoryName: "Professional Services",
    basicSpecs: [
      {
        key: "service_type",
        label: "Service Type",
        type: "string",
        unit: null,
      },
      {
        key: "provider_name",
        label: "Provider Name",
        type: "string",
        unit: null,
      },
      {
        key: "experience_years",
        label: "Experience (Years)",
        type: "number",
        unit: "years",
      },
    ],
    advancedSpecs: [
      {
        key: "certifications",
        label: "Certifications",
        type: "string",
        unit: null,
      },
      { key: "hourly_rate", label: "Hourly Rate", type: "number", unit: null },
    ],
  },
  {
    categoryName: "Manufacturing Services",
    basicSpecs: [
      {
        key: "service_type",
        label: "Service Type",
        type: "string",
        unit: null,
      },
      {
        key: "provider_name",
        label: "Provider Name",
        type: "string",
        unit: null,
      },
      {
        key: "minimum_order",
        label: "Minimum Order Quantity",
        type: "number",
        unit: null,
      },
    ],
    advancedSpecs: [
      {
        key: "lead_time_days",
        label: "Lead Time",
        type: "number",
        unit: "days",
      },
      {
        key: "certifications",
        label: "Certifications",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Music",
    basicSpecs: [
      {
        key: "format",
        label: "Format",
        type: "select",
        unit: null,
        options: ["CD", "Vinyl", "Digital Download"],
      },
      { key: "artist", label: "Artist", type: "string", unit: null },
      { key: "album_title", label: "Album Title", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "genre", label: "Genre", type: "string", unit: null },
      {
        key: "release_year",
        label: "Release Year",
        type: "number",
        unit: null,
      },
      {
        key: "number_of_tracks",
        label: "Number of Tracks",
        type: "number",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Video Games",
    basicSpecs: [
      { key: "title", label: "Title", type: "string", unit: null },
      {
        key: "platform",
        label: "Platform",
        type: "select",
        unit: null,
        options: ["PlayStation", "Xbox", "Nintendo", "PC"],
      },
      {
        key: "format",
        label: "Format",
        type: "select",
        unit: null,
        options: ["Physical", "Digital"],
      },
    ],
    advancedSpecs: [
      { key: "genre", label: "Genre", type: "string", unit: null },
      {
        key: "release_year",
        label: "Release Year",
        type: "number",
        unit: null,
      },
      { key: "age_rating", label: "Age Rating", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Movies",
    basicSpecs: [
      { key: "title", label: "Title", type: "string", unit: null },
      {
        key: "format",
        label: "Format",
        type: "select",
        unit: null,
        options: ["DVD", "Blu-ray", "4K UHD", "Digital"],
      },
      { key: "genre", label: "Genre", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "release_year",
        label: "Release Year",
        type: "number",
        unit: null,
      },
      { key: "duration", label: "Duration", type: "number", unit: "minutes" },
      { key: "director", label: "Director", type: "string", unit: null },
    ],
  },
  {
    categoryName: "Instruments",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "skill_level",
        label: "Skill Level",
        type: "select",
        unit: null,
        options: ["Beginner", "Intermediate", "Professional"],
      },
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "warranty", label: "Warranty", type: "number", unit: "years" },
    ],
  },
  {
    categoryName: "Land",
    basicSpecs: [
      { key: "location", label: "Location", type: "string", unit: null },
      { key: "area", label: "Area", type: "number", unit: "sqm" },
      { key: "zoning", label: "Zoning", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "title_type",
        label: "Title Type",
        type: "select",
        unit: null,
        options: ["Freehold", "Leasehold"],
      },
      { key: "soil_type", label: "Soil Type", type: "string", unit: null },
      {
        key: "access_to_road",
        label: "Road Access",
        type: "boolean",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Residential Buildings",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["House", "Apartment", "Villa"],
      },
      { key: "bedrooms", label: "Bedrooms", type: "number", unit: null },
      { key: "area", label: "Built-up Area", type: "number", unit: "sqm" },
    ],
    advancedSpecs: [
      { key: "year_built", label: "Year Built", type: "number", unit: null },
      { key: "furnished", label: "Furnished", type: "boolean", unit: null },
      {
        key: "parking_spaces",
        label: "Parking Spaces",
        type: "number",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Commercial Buildings",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Office", "Shop", "Warehouse"],
      },
      { key: "area", label: "Built-up Area", type: "number", unit: "sqm" },
      { key: "location", label: "Location", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "floors", label: "Number of Floors", type: "number", unit: null },
      {
        key: "parking_spaces",
        label: "Parking Spaces",
        type: "number",
        unit: null,
      },
      { key: "year_built", label: "Year Built", type: "number", unit: null },
    ],
  },
  {
    categoryName: "Minerals",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "purity", label: "Purity", type: "number", unit: "%" },
      { key: "quantity", label: "Quantity", type: "number", unit: "tons" },
    ],
    advancedSpecs: [
      { key: "origin", label: "Origin", type: "string", unit: null },
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
    ],
  },
  {
    categoryName: "Mining Equipment",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "model", label: "Model", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "capacity", label: "Capacity", type: "number", unit: "tons/h" },
      { key: "power", label: "Power", type: "number", unit: "kW" },
      { key: "weight", label: "Weight", type: "number", unit: "tons" },
    ],
  },
  {
    categoryName: "Mining Tools",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "material", label: "Material", type: "string", unit: null },
    ],
    advancedSpecs: [
      { key: "weight", label: "Weight", type: "number", unit: "kg" },
      { key: "length", label: "Length", type: "number", unit: "m" },
    ],
  },
  {
    categoryName: "Safety Gear",
    basicSpecs: [
      {
        key: "type",
        label: "Type",
        type: "select",
        unit: null,
        options: ["Helmet", "Gloves", "Boots", "Respirator"],
      },
      { key: "brand", label: "Brand", type: "string", unit: null },
      { key: "size", label: "Size", type: "string", unit: null },
    ],
    advancedSpecs: [
      {
        key: "certification",
        label: "Certification",
        type: "string",
        unit: null,
      },
      { key: "material", label: "Material", type: "string", unit: null },
      { key: "weight", label: "Weight", type: "number", unit: "g" },
    ],
  },
  {
    categoryName: "Raw Ores",
    basicSpecs: [
      { key: "type", label: "Type", type: "string", unit: null },
      { key: "grade", label: "Grade", type: "number", unit: "%" },
      { key: "quantity", label: "Quantity", type: "number", unit: "tons" },
    ],
    advancedSpecs: [
      { key: "origin", label: "Origin", type: "string", unit: null },
      {
        key: "moisture_content",
        label: "Moisture Content",
        type: "number",
        unit: "%",
      },
    ],
  },
];
