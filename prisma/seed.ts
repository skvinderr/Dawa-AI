import { PrismaClient } from "@prisma/client";
import { StoreType, OrderStatus, OrderMode } from "../lib/db";

const prisma = new PrismaClient();

async function main() {
  console.log("=================================================");
  console.log("   DawaaSetu - Seeding Database for Lucknow, UP   ");
  console.log("   [DEMO DATA - AI Kaushal Hackathon 2026]       ");
  console.log("=================================================\n");

  // Clear existing database tables
  console.log("Cleaning existing records...");
  await prisma.message.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.searchEvent.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.medicineSalt.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.salt.deleteMany();
  await prisma.store.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.user.deleteMany();

  // ----------------------------------------------------------------
  // 1. SEED USERS (3 Citizens + 3 Shopkeepers)
  // ----------------------------------------------------------------
  console.log("Seeding Users...");
  const user1Senior = await prisma.user.create({
    data: {
      name: "Ram Swaroop Shukla",
      phone: "+91 98390 12001",
      language: "hi",
      age: 72,
      annualIncome: 180000,
      category: "GENERAL",
      district: "Lucknow",
      hasChronicCondition: true, // Diabetes & Hypertension
      savedTotal: 3450.0,
      role: "CITIZEN",
    },
  });

  const user2Pregnant = await prisma.user.create({
    data: {
      name: "Sunita Verma",
      phone: "+91 98390 12002",
      language: "hi",
      age: 26,
      annualIncome: 240000,
      category: "OBC",
      district: "Lucknow",
      hasChronicCondition: false,
      savedTotal: 1280.0,
      role: "CITIZEN",
    },
  });

  const user3LowIncome = await prisma.user.create({
    data: {
      name: "Mohd. Aslam Ansari",
      phone: "+91 98390 12003",
      language: "hi",
      age: 44,
      annualIncome: 95000,
      category: "BPL",
      district: "Lucknow",
      hasChronicCondition: true, // Asthma / Gastric
      savedTotal: 4890.0,
      role: "CITIZEN",
    },
  });

  const shopkeeper1 = await prisma.user.create({
    data: {
      name: "Rajesh Kumar Gupta",
      phone: "+91 94150 11001",
      language: "en",
      age: 48,
      annualIncome: 650000,
      category: "GENERAL",
      district: "Lucknow",
      hasChronicCondition: false,
      savedTotal: 0,
      role: "SHOPKEEPER",
    },
  });

  const shopkeeper2 = await prisma.user.create({
    data: {
      name: "Dr. Anil Srivastava",
      phone: "+91 94150 22002",
      language: "en",
      age: 52,
      annualIncome: 500000,
      category: "GENERAL",
      district: "Lucknow",
      hasChronicCondition: false,
      savedTotal: 0,
      role: "SHOPKEEPER",
    },
  });

  const shopkeeper3 = await prisma.user.create({
    data: {
      name: "Vikram Singh Chauhan",
      phone: "+91 94150 33003",
      language: "hi",
      age: 39,
      annualIncome: 480000,
      category: "GENERAL",
      district: "Lucknow",
      hasChronicCondition: false,
      savedTotal: 0,
      role: "SHOPKEEPER",
    },
  });

  // ----------------------------------------------------------------
  // 2. SEED STORES (30 Stores in Lucknow: 6 Jan Aushadhi, 2 Hospital, 22 Private)
  // Areas: Gomti Nagar, Hazratganj, Aliganj, Indira Nagar, Alambagh, Chowk, Rajajipuram, Mahanagar
  // ----------------------------------------------------------------
  console.log("Seeding 30 Lucknow Stores...");

  const storeRawList: Array<{
    name: string;
    type: StoreType;
    address: string;
    area: string;
    lat: number;
    lng: number;
    phone: string;
    ownerName: string;
    openHours: string;
  }> = [
    // 6 Jan Aushadhi Kendras
    {
      name: "PM Jan Aushadhi Kendra - Hazratganj",
      type: StoreType.JAN_AUSHADHI,
      address: "Shop 12, SPM Civil Hospital Complex, Park Road, Hazratganj",
      area: "Hazratganj",
      lat: 26.8528,
      lng: 80.9463,
      phone: "+91 94150 88001",
      ownerName: "Dr. Sandeep Tandon",
      openHours: "08:00 AM - 10:00 PM",
    },
    {
      name: "PM Jan Aushadhi Kendra - Gomti Nagar",
      type: StoreType.JAN_AUSHADHI,
      address: "Manoj Pandey Chowk, Near Patrakarpuram, Gomti Nagar",
      area: "Gomti Nagar",
      lat: 26.8504,
      lng: 80.9995,
      phone: "+91 94150 88002",
      ownerName: "Dr. Anil Srivastava",
      openHours: "08:30 AM - 09:30 PM",
    },
    {
      name: "PM Jan Aushadhi Kendra - Chowk Medical Market",
      type: StoreType.JAN_AUSHADHI,
      address: "Shop 4, Phoolwali Gali, Near Chowk Chauraha",
      area: "Chowk",
      lat: 26.8682,
      lng: 80.9125,
      phone: "+91 94150 88003",
      ownerName: "Mohd. Tariq Siddiqui",
      openHours: "09:00 AM - 10:00 PM",
    },
    {
      name: "PM Jan Aushadhi Kendra - Alambagh",
      type: StoreType.JAN_AUSHADHI,
      address: "Plot 18, Opp. Alambagh Bus Terminal, VIP Road",
      area: "Alambagh",
      lat: 26.8152,
      lng: 80.9024,
      phone: "+91 94150 88004",
      ownerName: "Gurpreet Singh",
      openHours: "08:00 AM - 10:30 PM",
    },
    {
      name: "PM Jan Aushadhi Kendra - Aliganj Sector Q",
      type: StoreType.JAN_AUSHADHI,
      address: "Q-Block Commercial Complex, Sector Q, Aliganj",
      area: "Aliganj",
      lat: 26.8925,
      lng: 80.9412,
      phone: "+91 94150 88005",
      ownerName: "Poonam Sharma",
      openHours: "08:30 AM - 09:00 PM",
    },
    {
      name: "PM Jan Aushadhi Kendra - Indira Nagar Munshipulia",
      type: StoreType.JAN_AUSHADHI,
      address: "Near Munshipulia Metro Station, Sector 14, Indira Nagar",
      area: "Indira Nagar",
      lat: 26.8845,
      lng: 80.9856,
      phone: "+91 94150 88006",
      ownerName: "Alok Rastogi",
      openHours: "08:00 AM - 10:00 PM",
    },

    // 2 Hospital Pharmacies (24 Hours Open)
    {
      name: "KGMU Trauma Centre Hospital Pharmacy",
      type: StoreType.HOSPITAL,
      address: "Shah Mina Road, King George Medical University, Chowk",
      area: "Chowk",
      lat: 26.8715,
      lng: 80.9142,
      phone: "+91 522 2257540",
      ownerName: "KGMU Dispensary Board",
      openHours: "24 Hours Open",
    },
    {
      name: "Dr. Ram Manohar Lohia Hospital Pharmacy",
      type: StoreType.HOSPITAL,
      address: "Vibhuti Khand, Gomti Nagar, Lucknow",
      area: "Gomti Nagar",
      lat: 26.8623,
      lng: 81.0028,
      phone: "+91 522 6692000",
      ownerName: "RMLIMS Hospital Trust",
      openHours: "24 Hours Open",
    },

    // 22 Private Pharmacies across all key areas
    {
      name: "Sanjeevani Medicos & Healthcare",
      type: StoreType.PRIVATE,
      address: "MG Marg, Opposite GPO, Hazratganj",
      area: "Hazratganj",
      lat: 26.8505,
      lng: 80.9442,
      phone: "+91 94150 11001",
      ownerName: "Rajesh Kumar Gupta",
      openHours: "08:00 AM - 11:00 PM",
    },
    {
      name: "Apollo Pharmacy - Hazratganj",
      type: StoreType.PRIVATE,
      address: "Sapru Marg, Near Prem Motors, Hazratganj",
      area: "Hazratganj",
      lat: 26.8541,
      lng: 80.9485,
      phone: "+91 94150 11002",
      ownerName: "Apollo Health Co.",
      openHours: "24 Hours Open",
    },
    {
      name: "MedPlus Chemist - Hazratganj",
      type: StoreType.PRIVATE,
      address: "Shahnajaf Road, Near Sahara Ganj Mall, Hazratganj",
      area: "Hazratganj",
      lat: 26.8532,
      lng: 80.9521,
      phone: "+91 94150 11003",
      ownerName: "Deepak Mehra",
      openHours: "07:30 AM - 11:30 PM",
    },
    {
      name: "City Chemist & Surgical - Patrakarpuram",
      type: StoreType.PRIVATE,
      address: "Main Market, Patrakarpuram Crossing, Gomti Nagar",
      area: "Gomti Nagar",
      lat: 26.8492,
      lng: 80.9982,
      phone: "+91 94150 11004",
      ownerName: "Vivek Saxena",
      openHours: "08:00 AM - 11:00 PM",
    },
    {
      name: "Wellness Forever 24x7 - Gomti Nagar",
      type: StoreType.PRIVATE,
      address: "Vipul Khand 3, Near Hahnemann Chauraha, Gomti Nagar",
      area: "Gomti Nagar",
      lat: 26.8421,
      lng: 80.9954,
      phone: "+91 94150 11005",
      ownerName: "Nitin Agarwal",
      openHours: "24 Hours Open",
    },
    {
      name: "Avadh Medical Store - Vivek Khand",
      type: StoreType.PRIVATE,
      address: "Shop 7, Shopping Center, Vivek Khand 2, Gomti Nagar",
      area: "Gomti Nagar",
      lat: 26.8585,
      lng: 81.0112,
      phone: "+91 94150 11006",
      ownerName: "Mahesh Chandra",
      openHours: "08:30 AM - 10:30 PM",
    },
    {
      name: "Aliganj Drug Centre - Kapoorthala",
      type: StoreType.PRIVATE,
      address: "Near Kapoorthala Chauraha, Aliganj",
      area: "Aliganj",
      lat: 26.8872,
      lng: 80.9388,
      phone: "+91 94150 11007",
      ownerName: "Sanjay Dixit",
      openHours: "08:00 AM - 10:30 PM",
    },
    {
      name: "National Medical Hall - Sector B",
      type: StoreType.PRIVATE,
      address: "Sector B Main Road, Near Dandiya Bazar, Aliganj",
      area: "Aliganj",
      lat: 26.8911,
      lng: 80.9452,
      phone: "+91 94150 11008",
      ownerName: "Prashant Shukla",
      openHours: "09:00 AM - 10:00 PM",
    },
    {
      name: "Gupta Brothers Medicos - Indira Nagar",
      type: StoreType.PRIVATE,
      address: "Bhootnath Market, Block B, Indira Nagar",
      area: "Indira Nagar",
      lat: 26.8785,
      lng: 80.9822,
      phone: "+91 94150 11009",
      ownerName: "Rakesh Gupta",
      openHours: "08:00 AM - 11:00 PM",
    },
    {
      name: "Pooja Pharmacy - Ring Road",
      type: StoreType.PRIVATE,
      address: "Ring Road, Near Polytechnic Chauraha, Indira Nagar",
      area: "Indira Nagar",
      lat: 26.8892,
      lng: 80.9921,
      phone: "+91 94150 11010",
      ownerName: "Rameshwar Dayal",
      openHours: "08:30 AM - 10:30 PM",
    },
    {
      name: "Alambagh Chemists & Druggists",
      type: StoreType.PRIVATE,
      address: "Sardar Patel Marg, Alambagh Chauraha",
      area: "Alambagh",
      lat: 26.8168,
      lng: 80.9038,
      phone: "+91 94150 11011",
      ownerName: "Harpreet Singh",
      openHours: "08:00 AM - 10:30 PM",
    },
    {
      name: "Singhal Medical Agency - Singar Nagar",
      type: StoreType.PRIVATE,
      address: "Singar Nagar Metro Station Road, Alambagh",
      area: "Alambagh",
      lat: 26.8124,
      lng: 80.8992,
      phone: "+91 94150 11012",
      ownerName: "Sunil Singhal",
      openHours: "08:30 AM - 10:00 PM",
    },
    {
      name: "Chowk Relief Pharmacy",
      type: StoreType.PRIVATE,
      address: "Victoria Street, Near Gol Darwaza, Chowk",
      area: "Chowk",
      lat: 26.8695,
      lng: 80.9118,
      phone: "+91 94150 33003",
      ownerName: "Vikram Singh Chauhan",
      openHours: "08:00 AM - 11:00 PM",
    },
    {
      name: "Awadh Health Corner - Chowk",
      type: StoreType.PRIVATE,
      address: "Medical Market, Near Kotwali, Chowk",
      area: "Chowk",
      lat: 26.8665,
      lng: 80.9152,
      phone: "+91 94150 11014",
      ownerName: "Naveen Srivastava",
      openHours: "09:00 AM - 10:30 PM",
    },
    {
      name: "Rajajipuram Medical Store - Block C",
      type: StoreType.PRIVATE,
      address: "C-Block Market, Near Talkatora Stadium, Rajajipuram",
      area: "Rajajipuram",
      lat: 26.8375,
      lng: 80.8885,
      phone: "+91 94150 11015",
      ownerName: "Dinesh Mishra",
      openHours: "08:00 AM - 10:30 PM",
    },
    {
      name: "Shri Ram Medicos - Rajajipuram",
      type: StoreType.PRIVATE,
      address: "E-Block Chauraha, Mini Stadium Road, Rajajipuram",
      area: "Rajajipuram",
      lat: 26.8324,
      lng: 80.8841,
      phone: "+91 94150 11016",
      ownerName: "Shri Ram Verma",
      openHours: "08:30 AM - 10:00 PM",
    },
    {
      name: "Mahanagar Health Line Chemists",
      type: StoreType.PRIVATE,
      address: "Gole Market, Mahanagar",
      area: "Mahanagar",
      lat: 26.8792,
      lng: 80.9525,
      phone: "+91 94150 11017",
      ownerName: "Anupam Trivedi",
      openHours: "08:00 AM - 11:00 PM",
    },
    {
      name: "Chandra Medical Hall - Mahanagar",
      type: StoreType.PRIVATE,
      address: "Mandir Marg, Near IT College Chauraha, Mahanagar",
      area: "Mahanagar",
      lat: 26.8745,
      lng: 80.9482,
      phone: "+91 94150 11018",
      ownerName: "Subhash Chandra",
      openHours: "08:30 AM - 10:30 PM",
    },
    {
      name: "Krishna Chemist - Indira Nagar C-Block",
      type: StoreType.PRIVATE,
      address: "Sector C, Near Neelkanth Sweets, Indira Nagar",
      area: "Indira Nagar",
      lat: 26.8821,
      lng: 80.9785,
      phone: "+91 94150 11019",
      ownerName: "Krishnakant Pandey",
      openHours: "08:00 AM - 10:00 PM",
    },
    {
      name: "Janta Pharmacy - Alambagh Chander Nagar",
      type: StoreType.PRIVATE,
      address: "Chander Nagar Market, Alambagh",
      area: "Alambagh",
      lat: 26.8185,
      lng: 80.9065,
      phone: "+91 94150 11020",
      ownerName: "Mohd. Shakeel",
      openHours: "09:00 AM - 11:00 PM",
    },
    {
      name: "Balaji Medicos - Rajajipuram Meena Market",
      type: StoreType.PRIVATE,
      address: "Meena Market, Sector 11, Rajajipuram",
      area: "Rajajipuram",
      lat: 26.8402,
      lng: 80.8915,
      phone: "+91 94150 11021",
      ownerName: "Om Prakash Sharma",
      openHours: "08:00 AM - 10:00 PM",
    },
    {
      name: "Arogya Medical Store - Mahanagar Ext.",
      type: StoreType.PRIVATE,
      address: "Khurram Nagar Ring Road, Near Mahanagar Ext.",
      area: "Mahanagar",
      lat: 26.8835,
      lng: 80.9612,
      phone: "+91 94150 11022",
      ownerName: "Hemant Tiwari",
      openHours: "08:30 AM - 10:30 PM",
    },
  ];

  const createdStores: any[] = [];
  for (const s of storeRawList) {
    const store = await prisma.store.create({
      data: {
        name: s.name,
        type: s.type,
        address: s.address,
        area: s.area,
        lat: s.lat,
        lng: s.lng,
        phone: s.phone,
        ownerName: s.ownerName,
        openHours: s.openHours,
        isVerified: true,
      },
    });
    createdStores.push(store);
  }

  // ----------------------------------------------------------------
  // 3. SEED SALTS (Active Ingredients)
  // Categories: fever/pain, antibiotics, diabetes, BP, cardiac, gastric,
  // allergy, ORS, vitamins, thyroid (narrow therapeutic index), cough syrups
  // ----------------------------------------------------------------
  console.log("Seeding Active Salts...");

  const saltDefs = [
    { name: "Paracetamol", category: "analgesic / antipyretic", isNarrowTherapeuticIndex: false },
    { name: "Ibuprofen", category: "NSAID / analgesic", isNarrowTherapeuticIndex: false },
    { name: "Amoxicillin", category: "antibiotic", isNarrowTherapeuticIndex: false },
    { name: "Potassium Clavulanate", category: "beta-lactamase inhibitor", isNarrowTherapeuticIndex: false },
    { name: "Azithromycin", category: "macrolide antibiotic", isNarrowTherapeuticIndex: false },
    { name: "Cefixime", category: "cephalosporin antibiotic", isNarrowTherapeuticIndex: false },
    { name: "Metformin", category: "anti-diabetic (biguanide)", isNarrowTherapeuticIndex: false },
    { name: "Glimepiride", category: "anti-diabetic (sulfonylurea)", isNarrowTherapeuticIndex: false },
    { name: "Amlodipine", category: "anti-hypertensive (CCB)", isNarrowTherapeuticIndex: false },
    { name: "Telmisartan", category: "anti-hypertensive (ARB)", isNarrowTherapeuticIndex: false },
    { name: "Atorvastatin", category: "cardiac / lipid lowering", isNarrowTherapeuticIndex: false },
    { name: "Aspirin", category: "cardiac / antiplatelet", isNarrowTherapeuticIndex: false },
    { name: "Pantoprazole", category: "gastrointestinal / PPI", isNarrowTherapeuticIndex: false },
    { name: "Domperidone", category: "antiemetic / prokinetic", isNarrowTherapeuticIndex: false },
    { name: "Omeprazole", category: "gastrointestinal / PPI", isNarrowTherapeuticIndex: false },
    { name: "Cetirizine", category: "anti-allergic (antihistamine)", isNarrowTherapeuticIndex: false },
    { name: "Oral Rehydration Salts", category: "electrolyte rehydration", isNarrowTherapeuticIndex: false },
    { name: "Vitamin B-Complex", category: "multivitamin / supplement", isNarrowTherapeuticIndex: false },
    { name: "Cholecalciferol (Vitamin D3)", category: "vitamin supplement", isNarrowTherapeuticIndex: false },
    { name: "Levothyroxine Sodium", category: "thyroid hormone", isNarrowTherapeuticIndex: true }, // Narrow Therapeutic Index!
    { name: "Dextromethorphan Hydrobromide", category: "antitussive / cough suppressant", isNarrowTherapeuticIndex: false },
    { name: "Ambroxol Hydrochloride", category: "mucolytic expectorant", isNarrowTherapeuticIndex: false },
  ];

  const saltMap: Record<string, any> = {};
  for (const s of saltDefs) {
    const createdSalt = await prisma.salt.create({
      data: s,
    });
    saltMap[s.name] = createdSalt;
  }

  // ----------------------------------------------------------------
  // 4. SEED MEDICINES (~60+ medicines across salts with 3-5 variants)
  // Premium, Mid, Generic, and Jan Aushadhi (50-80% lower price)
  // ----------------------------------------------------------------
  console.log("Seeding ~75 Medicines with Salt Compositions...");

  interface MedDef {
    brandName: string;
    manufacturer: string;
    dosageForm: string;
    packSize: number;
    mrp: number;
    isGeneric: boolean;
    isJanAushadhi: boolean;
    isScheduledPriceControlled: boolean;
    ceilingPrice?: number;
    salts: Array<{ saltName: string; strength: string }>;
  }

  const medicineList: MedDef[] = [
    // --- 1. Paracetamol 650mg (pack of 15) ---
    {
      brandName: "Dolo 650",
      manufacturer: "Micro Labs Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 34.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 34.0,
      salts: [{ saltName: "Paracetamol", strength: "650mg" }],
    },
    {
      brandName: "Calpol 650",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 33.5,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 34.0,
      salts: [{ saltName: "Paracetamol", strength: "650mg" }],
    },
    {
      brandName: "Pacimol 650",
      manufacturer: "Ipca Laboratories",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 31.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 34.0,
      salts: [{ saltName: "Paracetamol", strength: "650mg" }],
    },
    {
      brandName: "Paracetamol 650 Generic",
      manufacturer: "Cipla Generics",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 20.0,
      isGeneric: true,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 34.0,
      salts: [{ saltName: "Paracetamol", strength: "650mg" }],
    },
    {
      brandName: "Jan Aushadhi Paracetamol 650",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 10.5,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Paracetamol", strength: "650mg" }],
    },

    // --- 2. Paracetamol 500mg (pack of 10) ---
    {
      brandName: "Crocin 500 Advance",
      manufacturer: "GlaxoSmithKline Asia",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 24.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 24.5,
      salts: [{ saltName: "Paracetamol", strength: "500mg" }],
    },
    {
      brandName: "Calpol 500",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 22.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 24.5,
      salts: [{ saltName: "Paracetamol", strength: "500mg" }],
    },
    {
      brandName: "Jan Aushadhi Paracetamol 500",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 6.8,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Paracetamol", strength: "500mg" }],
    },

    // --- 3. Ibuprofen 400mg (pack of 15) ---
    {
      brandName: "Brufen 400",
      manufacturer: "Abbott India",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 32.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 32.5,
      salts: [{ saltName: "Ibuprofen", strength: "400mg" }],
    },
    {
      brandName: "Ibugesic 400",
      manufacturer: "Cipla Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 26.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 32.5,
      salts: [{ saltName: "Ibuprofen", strength: "400mg" }],
    },
    {
      brandName: "Jan Aushadhi Ibuprofen 400",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 9.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Ibuprofen", strength: "400mg" }],
    },

    // --- 4. Amoxycillin + Potassium Clavulanate 625mg (pack of 10) ---
    {
      brandName: "Augmentin 625 Duo",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 220.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 225.0,
      salts: [
        { saltName: "Amoxicillin", strength: "500mg" },
        { saltName: "Potassium Clavulanate", strength: "125mg" },
      ],
    },
    {
      brandName: "Moxikind-CV 625",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 175.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 225.0,
      salts: [
        { saltName: "Amoxicillin", strength: "500mg" },
        { saltName: "Potassium Clavulanate", strength: "125mg" },
      ],
    },
    {
      brandName: "Clamp 625",
      manufacturer: "Alkem Laboratories",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 180.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 225.0,
      salts: [
        { saltName: "Amoxicillin", strength: "500mg" },
        { saltName: "Potassium Clavulanate", strength: "125mg" },
      ],
    },
    {
      brandName: "Amoxyclav 625 TrueCare",
      manufacturer: "Abbott Generics",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 110.0,
      isGeneric: true,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 225.0,
      salts: [
        { saltName: "Amoxicillin", strength: "500mg" },
        { saltName: "Potassium Clavulanate", strength: "125mg" },
      ],
    },
    {
      brandName: "Jan Aushadhi Amoxyclav 625",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 54.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Amoxicillin", strength: "500mg" },
        { saltName: "Potassium Clavulanate", strength: "125mg" },
      ],
    },

    // --- 5. Azithromycin 500mg (pack of 5) ---
    {
      brandName: "Azithral 500",
      manufacturer: "Alembic Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 5,
      mrp: 132.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 135.0,
      salts: [{ saltName: "Azithromycin", strength: "500mg" }],
    },
    {
      brandName: "Azee 500",
      manufacturer: "Cipla Ltd",
      dosageForm: "tablet",
      packSize: 5,
      mrp: 128.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 135.0,
      salts: [{ saltName: "Azithromycin", strength: "500mg" }],
    },
    {
      brandName: "Zady 500",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 5,
      mrp: 112.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 135.0,
      salts: [{ saltName: "Azithromycin", strength: "500mg" }],
    },
    {
      brandName: "Jan Aushadhi Azithromycin 500",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 5,
      mrp: 46.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Azithromycin", strength: "500mg" }],
    },

    // --- 6. Cefixime 200mg (pack of 10) ---
    {
      brandName: "Taxim-O 200",
      manufacturer: "Alkem Laboratories",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 185.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 190.0,
      salts: [{ saltName: "Cefixime", strength: "200mg" }],
    },
    {
      brandName: "Zifi 200",
      manufacturer: "FDC Ltd",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 178.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 190.0,
      salts: [{ saltName: "Cefixime", strength: "200mg" }],
    },
    {
      brandName: "Mahacef 200",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 145.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 190.0,
      salts: [{ saltName: "Cefixime", strength: "200mg" }],
    },
    {
      brandName: "Jan Aushadhi Cefixime 200",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 44.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Cefixime", strength: "200mg" }],
    },

    // --- 7. Metformin 500mg (pack of 10) ---
    {
      brandName: "Glycomet 500",
      manufacturer: "USV Pvt Ltd",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 25.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 26.0,
      salts: [{ saltName: "Metformin", strength: "500mg" }],
    },
    {
      brandName: "Obimet 500",
      manufacturer: "Abbott India",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 22.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 26.0,
      salts: [{ saltName: "Metformin", strength: "500mg" }],
    },
    {
      brandName: "Jan Aushadhi Metformin 500",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 6.5,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Metformin", strength: "500mg" }],
    },

    // --- 8. Metformin 500mg + Glimepiride 2mg (pack of 15) ---
    {
      brandName: "Glycomet-GP 2",
      manufacturer: "USV Pvt Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 165.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Metformin", strength: "500mg" },
        { saltName: "Glimepiride", strength: "2mg" },
      ],
    },
    {
      brandName: "Zoryl-M 2",
      manufacturer: "Intas Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 148.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Metformin", strength: "500mg" },
        { saltName: "Glimepiride", strength: "2mg" },
      ],
    },
    {
      brandName: "Glimestar-M 2",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 122.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Metformin", strength: "500mg" },
        { saltName: "Glimepiride", strength: "2mg" },
      ],
    },
    {
      brandName: "Jan Aushadhi Glimepiride & Metformin 2",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 32.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Metformin", strength: "500mg" },
        { saltName: "Glimepiride", strength: "2mg" },
      ],
    },

    // --- 9. Glimepiride 2mg (pack of 10) ---
    {
      brandName: "Amaryl 2mg",
      manufacturer: "Sanofi India",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 130.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Glimepiride", strength: "2mg" }],
    },
    {
      brandName: "Glimistar 2",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 75.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Glimepiride", strength: "2mg" }],
    },
    {
      brandName: "Jan Aushadhi Glimepiride 2",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 17.5,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Glimepiride", strength: "2mg" }],
    },

    // --- 10. Amlodipine 5mg (pack of 15) ---
    {
      brandName: "Amlong 5",
      manufacturer: "Micro Labs Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 55.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 56.0,
      salts: [{ saltName: "Amlodipine", strength: "5mg" }],
    },
    {
      brandName: "Stamlo 5",
      manufacturer: "Dr. Reddy's Laboratories",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 62.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 56.0, // DPCO enforced
      salts: [{ saltName: "Amlodipine", strength: "5mg" }],
    },
    {
      brandName: "Jan Aushadhi Amlodipine 5",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 12.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Amlodipine", strength: "5mg" }],
    },

    // --- 11. Telmisartan 40mg (pack of 15) ---
    {
      brandName: "Telma 40",
      manufacturer: "Glenmark Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 145.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 148.0,
      salts: [{ saltName: "Telmisartan", strength: "40mg" }],
    },
    {
      brandName: "Telmikind 40",
      manufacturer: "Mankind Pharma",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 85.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 148.0,
      salts: [{ saltName: "Telmisartan", strength: "40mg" }],
    },
    {
      brandName: "Tazloc 40",
      manufacturer: "USV Pvt Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 110.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 148.0,
      salts: [{ saltName: "Telmisartan", strength: "40mg" }],
    },
    {
      brandName: "Jan Aushadhi Telmisartan 40",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 22.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Telmisartan", strength: "40mg" }],
    },

    // --- 12. Atorvastatin 10mg (pack of 15) ---
    {
      brandName: "Atorva 10",
      manufacturer: "Zydus Cadila",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 150.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 152.0,
      salts: [{ saltName: "Atorvastatin", strength: "10mg" }],
    },
    {
      brandName: "Lipivas 10",
      manufacturer: "Cipla Ltd",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 135.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 152.0,
      salts: [{ saltName: "Atorvastatin", strength: "10mg" }],
    },
    {
      brandName: "Storvas 10",
      manufacturer: "Sun Pharmaceutical Industries",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 148.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 152.0,
      salts: [{ saltName: "Atorvastatin", strength: "10mg" }],
    },
    {
      brandName: "Jan Aushadhi Atorvastatin 10",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 15,
      mrp: 29.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Atorvastatin", strength: "10mg" }],
    },

    // --- 13. Aspirin 75mg (pack of 14) ---
    {
      brandName: "Ecosprin 75",
      manufacturer: "USV Pvt Ltd",
      dosageForm: "tablet",
      packSize: 14,
      mrp: 6.5,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 6.8,
      salts: [{ saltName: "Aspirin", strength: "75mg" }],
    },
    {
      brandName: "Loprin 75",
      manufacturer: "Unichem Laboratories",
      dosageForm: "tablet",
      packSize: 14,
      mrp: 6.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 6.8,
      salts: [{ saltName: "Aspirin", strength: "75mg" }],
    },
    {
      brandName: "Jan Aushadhi Aspirin 75",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 14,
      mrp: 2.8,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Aspirin", strength: "75mg" }],
    },

    // --- 14. Pantoprazole 40mg (pack of 10) ---
    {
      brandName: "Pantocid 40",
      manufacturer: "Sun Pharmaceutical Industries",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 122.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 125.0,
      salts: [{ saltName: "Pantoprazole", strength: "40mg" }],
    },
    {
      brandName: "Pan 40",
      manufacturer: "Alkem Laboratories",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 115.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 125.0,
      salts: [{ saltName: "Pantoprazole", strength: "40mg" }],
    },
    {
      brandName: "Pantodac 40",
      manufacturer: "Zydus Cadila",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 105.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 125.0,
      salts: [{ saltName: "Pantoprazole", strength: "40mg" }],
    },
    {
      brandName: "Jan Aushadhi Pantoprazole 40",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 22.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Pantoprazole", strength: "40mg" }],
    },

    // --- 15. Pantoprazole + Domperidone (Pan-D) (pack of 10) ---
    {
      brandName: "Pan-D",
      manufacturer: "Alkem Laboratories",
      dosageForm: "capsule",
      packSize: 10,
      mrp: 199.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Pantoprazole", strength: "40mg" },
        { saltName: "Domperidone", strength: "30mg" },
      ],
    },
    {
      brandName: "Pantocid-DSR",
      manufacturer: "Sun Pharmaceutical Industries",
      dosageForm: "capsule",
      packSize: 10,
      mrp: 185.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Pantoprazole", strength: "40mg" },
        { saltName: "Domperidone", strength: "30mg" },
      ],
    },
    {
      brandName: "Jan Aushadhi Pantoprazole & Domperidone SR",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "capsule",
      packSize: 10,
      mrp: 38.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Pantoprazole", strength: "40mg" },
        { saltName: "Domperidone", strength: "30mg" },
      ],
    },

    // --- 16. Omeprazole 20mg (pack of 15) ---
    {
      brandName: "Omez 20",
      manufacturer: "Dr. Reddy's Laboratories",
      dosageForm: "capsule",
      packSize: 15,
      mrp: 95.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 98.0,
      salts: [{ saltName: "Omeprazole", strength: "20mg" }],
    },
    {
      brandName: "Omee 20",
      manufacturer: "Alkem Laboratories",
      dosageForm: "capsule",
      packSize: 15,
      mrp: 68.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 98.0,
      salts: [{ saltName: "Omeprazole", strength: "20mg" }],
    },
    {
      brandName: "Jan Aushadhi Omeprazole 20",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "capsule",
      packSize: 15,
      mrp: 18.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Omeprazole", strength: "20mg" }],
    },

    // --- 17. Cetirizine 10mg (pack of 10) ---
    {
      brandName: "Cetzine 10",
      manufacturer: "Dr. Reddy's Laboratories",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 48.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 50.0,
      salts: [{ saltName: "Cetirizine", strength: "10mg" }],
    },
    {
      brandName: "Okacet 10",
      manufacturer: "Cipla Ltd",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 42.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 50.0,
      salts: [{ saltName: "Cetirizine", strength: "10mg" }],
    },
    {
      brandName: "Alerid 10",
      manufacturer: "Cipla Ltd",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 38.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 50.0,
      salts: [{ saltName: "Cetirizine", strength: "10mg" }],
    },
    {
      brandName: "Jan Aushadhi Cetirizine 10",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 10,
      mrp: 9.2,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Cetirizine", strength: "10mg" }],
    },

    // --- 18. Oral Rehydration Salts (sachet 21.8g) ---
    {
      brandName: "Electral ORS Powder",
      manufacturer: "FDC Ltd",
      dosageForm: "sachet",
      packSize: 1,
      mrp: 22.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 22.5,
      salts: [{ saltName: "Oral Rehydration Salts", strength: "21.8g" }],
    },
    {
      brandName: "Enerzal ORS Sachet",
      manufacturer: "FDC Ltd",
      dosageForm: "sachet",
      packSize: 1,
      mrp: 24.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 22.5,
      salts: [{ saltName: "Oral Rehydration Salts", strength: "21.8g" }],
    },
    {
      brandName: "Jan Aushadhi ORS Sachet",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "sachet",
      packSize: 1,
      mrp: 7.8,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Oral Rehydration Salts", strength: "21.8g" }],
    },

    // --- 19. Vitamin B-Complex (pack of 20) ---
    {
      brandName: "Becosules Z",
      manufacturer: "Pfizer India",
      dosageForm: "capsule",
      packSize: 20,
      mrp: 56.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Vitamin B-Complex", strength: "Therapeutic" }],
    },
    {
      brandName: "Cobadex Forte",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      dosageForm: "capsule",
      packSize: 20,
      mrp: 48.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Vitamin B-Complex", strength: "Therapeutic" }],
    },
    {
      brandName: "Jan Aushadhi Vitamin B-Complex with Zinc",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "capsule",
      packSize: 20,
      mrp: 12.5,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Vitamin B-Complex", strength: "Therapeutic" }],
    },

    // --- 20. Cholecalciferol (Vitamin D3) 60,000 IU (pack of 4) ---
    {
      brandName: "Calcirol 60K",
      manufacturer: "Cadila Healthcare",
      dosageForm: "capsule",
      packSize: 4,
      mrp: 130.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Cholecalciferol (Vitamin D3)", strength: "60000 IU" }],
    },
    {
      brandName: "Uprise-D3 60K",
      manufacturer: "Alkem Laboratories",
      dosageForm: "capsule",
      packSize: 4,
      mrp: 120.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Cholecalciferol (Vitamin D3)", strength: "60000 IU" }],
    },
    {
      brandName: "Jan Aushadhi Cholecalciferol 60K",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "capsule",
      packSize: 4,
      mrp: 26.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Cholecalciferol (Vitamin D3)", strength: "60000 IU" }],
    },

    // --- 21. Levothyroxine 50mcg (pack of 100) - NARROW THERAPEUTIC INDEX ---
    {
      brandName: "Eltroxin 50mcg",
      manufacturer: "GlaxoSmithKline Pharmaceuticals",
      dosageForm: "tablet",
      packSize: 100,
      mrp: 165.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 168.0,
      salts: [{ saltName: "Levothyroxine Sodium", strength: "50mcg" }],
    },
    {
      brandName: "Thyronorm 50mcg",
      manufacturer: "Abbott India",
      dosageForm: "tablet",
      packSize: 100,
      mrp: 172.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: true,
      ceilingPrice: 168.0,
      salts: [{ saltName: "Levothyroxine Sodium", strength: "50mcg" }],
    },
    {
      brandName: "Jan Aushadhi Levothyroxine 50mcg",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "tablet",
      packSize: 100,
      mrp: 45.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Levothyroxine Sodium", strength: "50mcg" }],
    },

    // --- 22. Cough Syrups (100ml bottle) ---
    {
      brandName: "Benadryl DR Cough Syrup",
      manufacturer: "Johnson & Johnson",
      dosageForm: "syrup",
      packSize: 1,
      mrp: 135.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [{ saltName: "Dextromethorphan Hydrobromide", strength: "10mg/5ml" }],
    },
    {
      brandName: "Ascoril-D Plus",
      manufacturer: "Glenmark Pharmaceuticals",
      dosageForm: "syrup",
      packSize: 1,
      mrp: 125.0,
      isGeneric: false,
      isJanAushadhi: false,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Dextromethorphan Hydrobromide", strength: "10mg/5ml" },
        { saltName: "Ambroxol Hydrochloride", strength: "15mg/5ml" },
      ],
    },
    {
      brandName: "Jan Aushadhi Cough Expectorant",
      manufacturer: "Bureau of Pharma PSUs of India (BPPI)",
      dosageForm: "syrup",
      packSize: 1,
      mrp: 32.0,
      isGeneric: true,
      isJanAushadhi: true,
      isScheduledPriceControlled: false,
      salts: [
        { saltName: "Dextromethorphan Hydrobromide", strength: "10mg/5ml" },
        { saltName: "Ambroxol Hydrochloride", strength: "15mg/5ml" },
      ],
    },
  ];

  const createdMedicines: any[] = [];
  for (const m of medicineList) {
    const med = await prisma.medicine.create({
      data: {
        brandName: m.brandName,
        manufacturer: m.manufacturer,
        dosageForm: m.dosageForm,
        packSize: m.packSize,
        mrp: m.mrp,
        isGeneric: m.isGeneric,
        isJanAushadhi: m.isJanAushadhi,
        isScheduledPriceControlled: m.isScheduledPriceControlled,
        ceilingPrice: m.ceilingPrice || null,
      },
    });

    // Link salts
    for (const s of m.salts) {
      const saltRecord = saltMap[s.saltName];
      if (saltRecord) {
        await prisma.medicineSalt.create({
          data: {
            medicineId: med.id,
            saltId: saltRecord.id,
            strength: s.strength,
          },
        });
      }
    }

    createdMedicines.push({ ...med, salts: m.salts });
  }

  // ----------------------------------------------------------------
  // 5. SEED INVENTORY
  // Each store stocks random 40-70% of medicines.
  // Prices strictly <= MRP and <= ceilingPrice (if price controlled).
  // Includes deliberate out-of-stock cases (quantity = 0) and near-expiry batches (< 45 days).
  // Jan Aushadhi stores heavily prioritize Jan Aushadhi generic medicines.
  // ----------------------------------------------------------------
  console.log("Seeding Store Inventory across 30 Stores...");

  const now = new Date();
  let nearExpiryCount = 0;
  let outOfStockCount = 0;
  let totalInventoryCount = 0;

  for (let sIdx = 0; sIdx < createdStores.length; sIdx++) {
    const store = createdStores[sIdx];
    const isJanAushadhiStore = store.type === StoreType.JAN_AUSHADHI;

    // Filter available medicines: Jan Aushadhi stores carry all Jan Aushadhi + selected generics
    for (let mIdx = 0; mIdx < createdMedicines.length; mIdx++) {
      const med = createdMedicines[mIdx];

      // Store stock probability
      let shouldStock = false;
      if (isJanAushadhiStore) {
        // High probability for Jan Aushadhi medicines, low for premium
        shouldStock = med.isJanAushadhi ? Math.random() < 0.95 : Math.random() < 0.15;
      } else {
        // Retail stores stock mostly branded + some generics
        shouldStock = med.isJanAushadhi ? Math.random() < 0.35 : Math.random() < 0.75;
      }

      if (!shouldStock) continue;

      // Price calculation: between 85% to 100% of MRP; never exceed ceilingPrice
      const maxAllowedPrice = med.ceilingPrice ? Math.min(med.mrp, med.ceilingPrice) : med.mrp;
      let sellingPrice = Number((maxAllowedPrice * (0.88 + Math.random() * 0.11)).toFixed(1));
      if (med.isJanAushadhi) {
        sellingPrice = med.mrp; // Jan Aushadhi is sold at fixed subsidized MRP
      }
      if (sellingPrice > maxAllowedPrice) {
        sellingPrice = maxAllowedPrice;
      }

      // Quantity: mostly 15 to 80 units; deliberate out-of-stock for 5% of records
      let quantity = Math.floor(Math.random() * 65) + 15;
      if (Math.random() < 0.05) {
        quantity = 0; // Deliberate Out-of-Stock
        outOfStockCount++;
      }

      // Expiry Date: mostly 6 to 24 months in future; 4% near-expiry within 45 days
      let expiryDate: Date;
      if (Math.random() < 0.04) {
        const nearDays = Math.floor(Math.random() * 40) + 5;
        expiryDate = new Date(now.getTime() + nearDays * 24 * 60 * 60 * 1000);
        nearExpiryCount++;
      } else {
        const futureDays = Math.floor(Math.random() * 500) + 180;
        expiryDate = new Date(now.getTime() + futureDays * 24 * 60 * 60 * 1000);
      }

      const batchNo = `B-${sIdx + 101}-${mIdx + 1}-${Math.floor(Math.random() * 900) + 100}`;

      await prisma.inventory.create({
        data: {
          storeId: store.id,
          medicineId: med.id,
          quantity: quantity,
          sellingPrice: sellingPrice,
          expiryDate: expiryDate,
          batchNo: batchNo,
          lastUpdated: new Date(now.getTime() - Math.floor(Math.random() * 48) * 3600 * 1000),
        },
      });
      totalInventoryCount++;
    }
  }

  console.log(
    `Inventory created: ${totalInventoryCount} rows (${outOfStockCount} out-of-stock, ${nearExpiryCount} near-expiry <45d)`
  );

  // ----------------------------------------------------------------
  // 6. SEED GOVERNMENT SCHEMES (8 schemes with detailed eligibility JSON)
  // ----------------------------------------------------------------
  console.log("Seeding 8 UP & National Healthcare Schemes...");

  const schemesData = [
    {
      name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
      description:
        "World's largest government-funded health assurance scheme providing health cover of Rs. 5 Lakh per family per year for secondary and tertiary care hospitalization across empanelled public and private hospitals.",
      eligibility: JSON.stringify({
        ageRange: "All ages (0-100)",
        incomeCeiling: "Identified via SECC 2011 deprivation criteria / BPL / Antyodaya",
        state: "All India & Uttar Pradesh",
        categories: ["BPL", "SECC 2011", "Antyodaya Anna Yojana (AAY)", "Destitute"],
        conditions: [
          "Secondary and tertiary hospital treatment",
          "All essential pre/during/post hospitalisation medications included",
          "Cashless and paperless access at empanelled hospitals",
        ],
      }),
      benefitText: "Rs. 5,00,000 cashless cover per family per year for secondary & tertiary hospitalisation",
      howToApply:
        "Check eligibility at nearest Ayushman Mitra at District Hospital, CSC centre, or visit beneficiary.nha.gov.in with Aadhaar & Ration Card.",
      officialUrl: "https://beneficiary.nha.gov.in",
    },
    {
      name: "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
      description:
        "Government initiative by the Department of Pharmaceuticals to make quality generic medicines available at affordable prices (50% to 80% lower than branded market prices) through dedicated Jan Aushadhi Kendras.",
      eligibility: JSON.stringify({
        ageRange: "All citizens",
        incomeCeiling: "No income limit - Universal access for all citizens",
        state: "Uttar Pradesh & Nationwide",
        categories: ["Universal", "Citizen", "Senior Citizen", "BPL", "Middle Class"],
        conditions: [
          "Available over-the-counter for OTC medicines",
          "Valid doctor prescription required for scheduled/prescription medicines",
        ],
      }),
      benefitText: "50% to 90% direct retail savings on 1,800+ essential medicines & 290+ surgical consumables",
      howToApply:
        "Walk into any of the 6+ certified PM Jan Aushadhi Kendras in Lucknow with your doctor prescription.",
      officialUrl: "https://janaushadhi.gov.in",
    },
    {
      name: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
      description:
        "National program providing comprehensive, quality antenatal care (ANC) free of cost to all pregnant women on the 9th of every month across designated government health facilities.",
      eligibility: JSON.stringify({
        ageRange: "18 - 45 years",
        incomeCeiling: "Universal for all pregnant women",
        state: "Uttar Pradesh",
        categories: ["Pregnant Women (2nd & 3rd Trimester)"],
        conditions: [
          "Free diagnostic tests (blood, urine, ultrasound)",
          "Free Iron Folic Acid (IFA) and Calcium tablets",
          "Specialist OB/GYN consultation at PHC/CHC/District hospitals",
        ],
      }),
      benefitText: "100% free specialist antenatal checkups, ultrasounds, and maternal vitamins on 9th of every month",
      howToApply:
        "Visit your nearest Community Health Centre (CHC) or District Women Hospital on the 9th of any month with Mother and Child Protection (MCP) card.",
      officialUrl: "https://pmsma.nhp.gov.in",
    },
    {
      name: "Rashtriya Bal Swasthya Karyakram (RBSK)",
      description:
        "Child health screening and early intervention services covering '4Ds': Defects at birth, Deficiencies, Diseases, and Developmental delays including disabilities from birth to 18 years of age.",
      eligibility: JSON.stringify({
        ageRange: "0 - 18 years",
        incomeCeiling: "No income bar - covers Anganwadi children and government school students",
        state: "Uttar Pradesh",
        categories: ["Infants", "Children", "Adolescents"],
        conditions: [
          "Free screening by mobile health teams",
          "Free surgical and medical management at District Early Intervention Centres (DEIC)",
        ],
      }),
      benefitText: "Free screening, surgical corrections, and life-saving pediatric medications for 30+ health conditions",
      howToApply:
        "Contact the nearest Anganwadi centre, government school health coordinator, or District Hospital DEIC Lucknow.",
      officialUrl: "https://rbsk.gov.in",
    },
    {
      name: "National Programme for Prevention & Control of NCDs (NP-NCD)",
      description:
        "Free screening, diagnosis, and continuous monthly drug supply for non-communicable diseases: Diabetes, Hypertension, and Common Cancers through NCD clinics across UP.",
      eligibility: JSON.stringify({
        ageRange: "30 years and above",
        incomeCeiling: "Universal access through public healthcare system",
        state: "Uttar Pradesh",
        categories: ["Adults 30+", "Senior Citizens", "Diabetic Patients", "Hypertensive Patients"],
        conditions: [
          "Free CBAC screening at Health and Wellness Centres (Ayushman Arogya Mandir)",
          "Free monthly supply of Metformin, Glimepiride, Amlodipine, Telmisartan, and Atorvastatin",
        ],
      }),
      benefitText: "Free continuous monthly prescription medicines for Diabetes, High Blood Pressure, and Heart Disease",
      howToApply:
        "Visit nearest Ayushman Arogya Mandir / Sub-Centre in Lucknow for CBAC assessment and free drug dispensing.",
      officialUrl: "https://npcdcs.mohfw.gov.in",
    },
    {
      name: "Free Drugs Service Initiative (UP State Public Health)",
      description:
        "Universal free provision of essential medicines at all government healthcare facilities in Uttar Pradesh (District Hospitals, CHCs, PHCs, and Medical Colleges).",
      eligibility: JSON.stringify({
        ageRange: "All ages",
        incomeCeiling: "No income requirement",
        state: "Uttar Pradesh",
        categories: ["All UP Residents", "Outpatients", "Inpatients"],
        conditions: [
          "Valid OPD slip or IPD admission at UP Government health facility",
          "Covers 300+ Essential Drugs List (EDL) medicines",
        ],
      }),
      benefitText: "100% free medicines from the hospital pharmacy counter for all prescribed EDL drugs",
      howToApply:
        "Get examined by a government doctor at KGMU, Civil Hospital, Balrampur Hospital, or any Lucknow CHC.",
      officialUrl: "https://uphealth.up.nic.in",
    },
    {
      name: "Mukhyamantri Jan Arogya Yojana (UP State Health Scheme)",
      description:
        "State health insurance scheme of Uttar Pradesh providing Rs. 5 Lakh per year cashless coverage for vulnerable families not enrolled in central SECC PM-JAY. Note: verify specific guidelines on official portal.",
      eligibility: JSON.stringify({
        ageRange: "All family members",
        incomeCeiling: "Antyodaya and Eligible Household (Patra Grihasthi) ration card holders",
        state: "Uttar Pradesh (State Specific)",
        categories: ["Antyodaya Card Holders", "Registered Construction Workers (BOCW)", "Fishermen"],
        conditions: [
          "Domicile of Uttar Pradesh",
          "Verification via Ration Card or BOCW labour registration",
        ],
      }),
      benefitText: "Rs. 5,00,000 cashless secondary and tertiary hospitalisation cover backed by UP State Govt",
      howToApply:
        "Visit nearest Jan Seva Kendra / CSC in Uttar Pradesh with UP Ration Card and verify on official portal.",
      officialUrl: "https://upmysy.up.gov.in",
    },
    {
      name: "Ayushman Bharat PM-JAY Vay Vandana (Senior Citizens 70+)",
      description:
        "Newly launched special universal health coverage for all senior citizens aged 70 years and above, irrespective of socioeconomic status or family income.",
      eligibility: JSON.stringify({
        ageRange: "70 years and above (Strict Age Cutoff)",
        incomeCeiling: "No income criteria - Universal for all 70+ seniors",
        state: "All India & Uttar Pradesh",
        categories: ["Senior Citizens 70+", "Geriatric Care"],
        conditions: [
          "Aadhaar card age verification showing 70+ years",
          "Dedicated Ayushman Vay Vandana card issued",
        ],
      }),
      benefitText: "Distinct top-up cover of Rs. 5,00,000 annually dedicated exclusively to the senior citizen",
      howToApply:
        "Apply online on beneficiary.nha.gov.in or Ayushman App by self-eKYC using Aadhaar OTP.",
      officialUrl: "https://beneficiary.nha.gov.in",
    },
  ];

  for (const sc of schemesData) {
    await prisma.scheme.create({
      data: sc,
    });
  }

  // ----------------------------------------------------------------
  // 7. SEED 400 SEARCH EVENTS (Past 14 days)
  // WITH OUTBREAK SPIKE: Fever, ORS, Paracetamol, Antibiotics in Chowk & Alambagh over last 3 days
  // ----------------------------------------------------------------
  console.log("Seeding 400 Search Events (with deliberate outbreak spike in Chowk & Alambagh)...");

  const areas = [
    { name: "Gomti Nagar", lat: 26.8504, lng: 80.9995 },
    { name: "Hazratganj", lat: 26.8528, lng: 80.9463 },
    { name: "Aliganj", lat: 26.8872, lng: 80.9388 },
    { name: "Indira Nagar", lat: 26.8845, lng: 80.9856 },
    { name: "Alambagh", lat: 26.8152, lng: 80.9024 },
    { name: "Chowk", lat: 26.8682, lng: 80.9125 },
    { name: "Rajajipuram", lat: 26.8375, lng: 80.8885 },
    { name: "Mahanagar", lat: 26.8792, lng: 80.9525 },
  ];

  const standardQueries = [
    { q: "Glycomet 500", salt: "Metformin" },
    { q: "Telma 40 for BP", salt: "Telmisartan" },
    { q: "Pan-D acidity", salt: "Pantoprazole" },
    { q: "Atorva cholesterol", salt: "Atorvastatin" },
    { q: "Becosules vitamins", salt: "Vitamin B-Complex" },
    { q: "Thyronorm 50", salt: "Levothyroxine Sodium" },
    { q: "Cetirizine allergy", salt: "Cetirizine" },
    { q: "Amlong 5mg", salt: "Amlodipine" },
    { q: "Brufen pain", salt: "Ibuprofen" },
    { q: "Benadryl cough", salt: "Dextromethorphan Hydrobromide" },
  ];

  const outbreakQueries = [
    { q: "High fever paracetamol", salt: "Paracetamol" },
    { q: "Dolo 650 fever Lucknow", salt: "Paracetamol" },
    { q: "ORS sachet dehydration", salt: "Oral Rehydration Salts" },
    { q: "Electral powder diarrhea", salt: "Oral Rehydration Salts" },
    { q: "Azithral 500 throat fever", salt: "Azithromycin" },
    { q: "Augmentin 625 infection", salt: "Amoxicillin" },
    { q: "Viral fever medicine", salt: "Paracetamol" },
    { q: "Severe stomach flu vomiting", salt: "Oral Rehydration Salts" },
  ];

  const searchEventsData: any[] = [];

  // Part A: Normal background searches (220 events across 14 days across all 8 areas)
  for (let i = 0; i < 220; i++) {
    const dayOffset = Math.floor(Math.random() * 14); // 0 to 13 days ago
    const hourOffset = Math.floor(Math.random() * 24);
    const minuteOffset = Math.floor(Math.random() * 60);
    const eventTime = new Date(
      now.getTime() - (dayOffset * 24 * 3600 + hourOffset * 3600 + minuteOffset * 60) * 1000
    );

    const areaObj = areas[Math.floor(Math.random() * areas.length)];
    const queryObj = standardQueries[Math.floor(Math.random() * standardQueries.length)];
    const saltRecord = saltMap[queryObj.salt];

    // Jitter coordinates slightly around the area centre (+- 0.008 deg)
    const lat = Number((areaObj.lat + (Math.random() - 0.5) * 0.015).toFixed(5));
    const lng = Number((areaObj.lng + (Math.random() - 0.5) * 0.015).toFixed(5));

    searchEventsData.push({
      query: queryObj.q,
      saltId: saltRecord ? saltRecord.id : null,
      area: areaObj.name,
      lat: lat,
      lng: lng,
      createdAt: eventTime,
      userId: Math.random() < 0.2 ? user1Senior.id : null,
    });
  }

  // Part B: OUTBREAK SURGE SPIKE in Chowk & Alambagh over last 3 days (180 events)
  const outbreakAreas = [
    { name: "Chowk", lat: 26.8682, lng: 80.9125 },
    { name: "Alambagh", lat: 26.8152, lng: 80.9024 },
  ];

  for (let i = 0; i < 180; i++) {
    // Confined to last 3 days (0, 1, or 2 days ago) with high density in last 24-48 hours
    const dayOffset = Math.random() < 0.65 ? 0 : Math.random() < 0.85 ? 1 : 2;
    const hourOffset = Math.floor(Math.random() * 24);
    const minuteOffset = Math.floor(Math.random() * 60);
    const eventTime = new Date(
      now.getTime() - (dayOffset * 24 * 3600 + hourOffset * 3600 + minuteOffset * 60) * 1000
    );

    const areaObj = outbreakAreas[Math.floor(Math.random() * outbreakAreas.length)];
    const queryObj = outbreakQueries[Math.floor(Math.random() * outbreakQueries.length)];
    const saltRecord = saltMap[queryObj.salt];

    const lat = Number((areaObj.lat + (Math.random() - 0.5) * 0.012).toFixed(5));
    const lng = Number((areaObj.lng + (Math.random() - 0.5) * 0.012).toFixed(5));

    searchEventsData.push({
      query: queryObj.q,
      saltId: saltRecord ? saltRecord.id : null,
      area: areaObj.name,
      lat: lat,
      lng: lng,
      createdAt: eventTime,
      userId: null,
    });
  }

  // Insert all 400 SearchEvents
  for (const se of searchEventsData) {
    await prisma.searchEvent.create({
      data: se,
    });
  }

  // ----------------------------------------------------------------
  // 8. SEED ORDERS, ORDER ITEMS & MESSAGES
  // ----------------------------------------------------------------
  console.log("Seeding Demo Orders, Items & In-app Messages...");

  // Order 1: Senior citizen Ram Swaroop reserved Metformin & Telmisartan at Jan Aushadhi Hazratganj
  const janHazratganj = createdStores.find((s) => s.name.includes("Hazratganj") && s.type === StoreType.JAN_AUSHADHI);
  const genMetformin = createdMedicines.find((m) => m.brandName.includes("Jan Aushadhi Metformin 500"));
  const genTelma = createdMedicines.find((m) => m.brandName.includes("Jan Aushadhi Telmisartan 40"));

  if (janHazratganj && genMetformin && genTelma) {
    const order1 = await prisma.order.create({
      data: {
        userId: user1Senior.id,
        storeId: janHazratganj.id,
        status: OrderStatus.CONFIRMED,
        mode: OrderMode.PICKUP,
        createdAt: new Date(now.getTime() - 4 * 3600 * 1000),
        holdExpiresAt: new Date(now.getTime() + 2 * 3600 * 1000),
        totalPaid: 28.5,
        totalMrpBaseline: 170.0,
        savings: 141.5, // 83% savings
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        medicineId: genMetformin.id,
        quantity: 1,
        unitPrice: 6.5,
        baselinePrice: 25.0,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        medicineId: genTelma.id,
        quantity: 1,
        unitPrice: 22.0,
        baselinePrice: 145.0,
      },
    });

    // Messages on thread
    await prisma.message.create({
      data: {
        orderId: order1.id,
        userId: user1Senior.id,
        storeId: janHazratganj.id,
        senderRole: "CITIZEN",
        text: "Namaste, I have placed a 2-hour hold for Jan Aushadhi Telmisartan 40mg and Metformin 500mg. Reaching Hazratganj by 4 PM.",
        createdAt: new Date(now.getTime() - 3.8 * 3600 * 1000),
      },
    });

    await prisma.message.create({
      data: {
        orderId: order1.id,
        userId: user1Senior.id,
        storeId: janHazratganj.id,
        senderRole: "STORE",
        text: "Ji Shukla ji, your medicines are packed and kept at Counter 2. Please show order ID upon arrival.",
        createdAt: new Date(now.getTime() - 3.5 * 3600 * 1000),
      },
    });
  }

  // Order 2: Sunita Verma (Pregnant woman) reserved Calcium / Vitamin D3 at Gomti Nagar
  const storeGomti = createdStores.find((s) => s.area === "Gomti Nagar" && s.type === StoreType.PRIVATE);
  const vitD3 = createdMedicines.find((m) => m.brandName.includes("Calcirol 60K"));
  if (storeGomti && vitD3) {
    const order2 = await prisma.order.create({
      data: {
        userId: user2Pregnant.id,
        storeId: storeGomti.id,
        status: OrderStatus.READY,
        mode: OrderMode.PICKUP,
        createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
        holdExpiresAt: new Date(now.getTime() + 1 * 3600 * 1000),
        totalPaid: 120.0,
        totalMrpBaseline: 130.0,
        savings: 10.0,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        medicineId: vitD3.id,
        quantity: 1,
        unitPrice: 120.0,
        baselinePrice: 130.0,
      },
    });

    await prisma.message.create({
      data: {
        orderId: order2.id,
        userId: user2Pregnant.id,
        storeId: storeGomti.id,
        senderRole: "STORE",
        text: "Your prescription reservation is ready for pickup at Patrakarpuram counter.",
        createdAt: new Date(now.getTime() - 1.5 * 3600 * 1000),
      },
    });
  }

  // ----------------------------------------------------------------
  // 9. VERIFICATION & ROW COUNT AUDIT
  // ----------------------------------------------------------------
  console.log("\n=================================================");
  console.log("   DawaaSetu - Database Seeding Complete Audit    ");
  console.log("=================================================");

  const countStores = await prisma.store.count();
  const countJanAushadhi = await prisma.store.count({ where: { type: StoreType.JAN_AUSHADHI } });
  const countHospitals = await prisma.store.count({ where: { type: StoreType.HOSPITAL } });
  const countPrivate = await prisma.store.count({ where: { type: StoreType.PRIVATE } });

  const countSalts = await prisma.salt.count();
  const countNarrowTherapeutic = await prisma.salt.count({ where: { isNarrowTherapeuticIndex: true } });

  const countMedicines = await prisma.medicine.count();
  const countJanAushadhiMeds = await prisma.medicine.count({ where: { isJanAushadhi: true } });
  const countGenericMeds = await prisma.medicine.count({ where: { isGeneric: true } });
  const countPriceControlled = await prisma.medicine.count({ where: { isScheduledPriceControlled: true } });

  const countMedicineSalts = await prisma.medicineSalt.count();
  const countInventory = await prisma.inventory.count();
  const countOutOfStock = await prisma.inventory.count({ where: { quantity: 0 } });

  const countSchemes = await prisma.scheme.count();
  const countSearchEvents = await prisma.searchEvent.count();
  const countChowkAlambaghSpike = await prisma.searchEvent.count({
    where: { area: { in: ["Chowk", "Alambagh"] } },
  });

  const countUsers = await prisma.user.count();
  const countOrders = await prisma.order.count();
  const countOrderItems = await prisma.orderItem.count();
  const countMessages = await prisma.message.count();

  console.log(`- Stores:                  ${countStores} (Jan Aushadhi: ${countJanAushadhi}, Hospitals: ${countHospitals}, Private: ${countPrivate})`);
  console.log(`- Salts (Active):          ${countSalts} (Narrow Therapeutic Index: ${countNarrowTherapeutic})`);
  console.log(`- Medicines:               ${countMedicines} (Jan Aushadhi: ${countJanAushadhiMeds}, Generic: ${countGenericMeds}, Price Controlled: ${countPriceControlled})`);
  console.log(`- Medicine-Salt Links:     ${countMedicineSalts}`);
  console.log(`- Inventory Records:       ${countInventory} (Out of Stock: ${countOutOfStock})`);
  console.log(`- Government Schemes:      ${countSchemes}`);
  console.log(`- Outbreak Search Events:  ${countSearchEvents} (Spike in Chowk/Alambagh: ${countChowkAlambaghSpike})`);
  console.log(`- Users:                   ${countUsers} (3 Citizens, 3 Pharmacists)`);
  console.log(`- Orders:                  ${countOrders}`);
  console.log(`- Order Items:             ${countOrderItems}`);
  console.log(`- Messages / Threads:      ${countMessages}`);
  console.log("=================================================\n");
}

main()
  .catch((e) => {
    console.error("Seed execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
