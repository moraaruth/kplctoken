import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { calculateKplcBreakdown, generateKplcToken, seedMeters, seedTransactions, seedFamilyMembers, seedRentalProperties } from "./src/data";
import { Meter, Transaction, FamilyMember, RentalProperty, UserProfile } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // In-Memory Database State
  let userProfile: UserProfile = {
    id: "u1",
    name: "Jomo Omondi",
    phone: "+254 722 000 111",
    email: "jomo.omondi@stimatap.co.ke",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    biometricEnabled: true,
    pinSet: true,
    currency: "KES",
    darkMode: false,
    textScale: "md",
    lowTokenAlert: true,
    lowTokenThreshold: 15.0
  };

  let meters: Meter[] = [...seedMeters];
  let transactions: Transaction[] = [...seedTransactions];
  let familyMembers: FamilyMember[] = [...seedFamilyMembers];
  let rentalProperties: RentalProperty[] = [...seedRentalProperties];
  let otps: Record<string, string> = {}; // phone -> otp
  
  // Pending STK transactions tracker
  let pendingPayments: Record<string, {
    meterId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    tokenCode?: string;
    receiptNumber?: string;
  }> = {};

  // ==================== API ENDPOINTS ====================

  // Auth Endpoints
  app.get("/api/auth/me", (req, res) => {
    res.json(userProfile);
  });

  app.post("/api/auth/profile", (req, res) => {
    userProfile = { ...userProfile, ...req.body };
    res.json(userProfile);
  });

  app.post("/api/auth/verify-phone", (req, res) => {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    // Generate a simple 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otps[phone] = otp;
    
    console.log(`[Daraja SMS Service] Sent OTP ${otp} to ${phone}`);
    res.json({ success: true, message: "OTP sent successfully via SMS", otp }); // Echo OTP in API response for simulation ease!
  });

  app.post("/api/auth/confirm-otp", (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required" });
    }

    if (otps[phone] === otp || otp === "1234") { // Allow 1234 as master simulation OTP
      delete otps[phone];
      userProfile.phone = phone;
      userProfile.pinSet = true;
      return res.json({ success: true, profile: userProfile });
    } else {
      return res.status(400).json({ error: "Invalid OTP code. Please try again." });
    }
  });

  // Meters Endpoints
  app.get("/api/meters", (req, res) => {
    res.json(meters);
  });

  app.post("/api/meters", (req, res) => {
    const { meterNumber, nickname, address, isRental, tenantName, tenantPhone } = req.body;
    if (!meterNumber || !nickname) {
      return res.status(400).json({ error: "Meter number and nickname are required" });
    }

    // Verify meter structure
    const cleanedMeter = meterNumber.replace(/\s+/g, "").replace(/-/g, "");
    if (cleanedMeter.length < 9 || cleanedMeter.length > 12 || isNaN(Number(cleanedMeter))) {
      return res.status(400).json({ error: "Invalid KPLC meter format. Must be 9-11 digits." });
    }

    // Standardize formatting: 1234-5678-901
    const parts = cleanedMeter.match(/.{1,4}/g) || [cleanedMeter];
    const formattedMeterNumber = parts.join("-");

    const newMeter: Meter = {
      id: `m_${Date.now()}`,
      meterNumber: formattedMeterNumber,
      nickname,
      address: address || "Nairobi, Kenya",
      balanceKwh: 0, // Starts at 0
      averageDailyKwh: isRental ? 5.0 : 3.5,
      status: "low",
      ownerId: userProfile.id,
      isRental: !!isRental,
      tenantName: isRental ? tenantName : undefined,
      tenantPhone: isRental ? tenantPhone : undefined
    };

    meters.push(newMeter);

    // If it's a rental property, also add it to rental tracker
    if (isRental) {
      const newRental: RentalProperty = {
        id: `rp_${Date.now()}`,
        propertyName: nickname.split(" - ")[0] || "Rental Property",
        unitNumber: nickname.split(" - ")[1] || "Unit 1",
        meterId: newMeter.id,
        meterNumber: newMeter.meterNumber,
        tenantName: tenantName || "New Tenant",
        tenantPhone: tenantPhone || "",
        currentKwh: 0,
        autoNotify: true,
        warningThreshold: 10
      };
      rentalProperties.push(newRental);
    }

    res.status(201).json(newMeter);
  });

  app.delete("/api/meters/:id", (req, res) => {
    const { id } = req.params;
    meters = meters.filter(m => m.id !== id);
    rentalProperties = rentalProperties.filter(rp => rp.meterId !== id);
    res.json({ success: true, message: "Meter deleted successfully" });
  });

  // Transactions Endpoints
  app.get("/api/transactions", (req, res) => {
    res.json(transactions);
  });

  // M-Pesa Daraja STK Push Simulation
  app.post("/api/purchase/stk-push", (req, res) => {
    const { phone, amount, meterId } = req.body;
    if (!phone || !amount || !meterId) {
      return res.status(400).json({ error: "Phone, amount, and meterId are required" });
    }

    const meter = meters.find(m => m.id === meterId);
    if (!meter) {
      return res.status(404).json({ error: "Meter not found" });
    }

    // Generate unique Daraja CheckoutRequestID
    const checkoutRequestId = `ws_CO_${Date.now().toString().slice(-10)}_${Math.floor(100 + Math.random() * 900)}`;
    
    // Store in-memory as pending
    pendingPayments[checkoutRequestId] = {
      meterId,
      amount: Number(amount),
      status: "pending"
    };

    console.log(`[Daraja API] STK Push requested for ${phone} - Amount: KES ${amount} - CheckoutRequestID: ${checkoutRequestId}`);

    res.json({
      success: true,
      checkoutRequestId,
      customerMessage: "Success. Request accepted for processing."
    });
  });

  // Long polling endpoint to check status of payment
  app.get("/api/purchase/status/:checkoutRequestId", (req, res) => {
    const { checkoutRequestId } = req.params;
    const payment = pendingPayments[checkoutRequestId];
    
    if (!payment) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      checkoutRequestId,
      status: payment.status,
      tokenCode: payment.tokenCode,
      receiptNumber: payment.receiptNumber
    });
  });

  // Safaricom M-Pesa Callback simulation (Webhook)
  // This is called by our Daraja STK simulator panel to trigger success/failure
  app.post("/api/purchase/callback", (req, res) => {
    const { checkoutRequestId, resultCode, mpesaReceiptNumber } = req.body;
    const payment = pendingPayments[checkoutRequestId];

    if (!payment) {
      return res.status(404).json({ error: "Payment request not found on server" });
    }

    if (resultCode === 0) {
      // SUCCESSFUL payment
      const receipt = mpesaReceiptNumber || `MPESA${Math.floor(1000000 + Math.random() * 9000000)}`;
      const token = generateKplcToken();
      const meter = meters.find(m => m.id === payment.meterId);
      
      const { kwh, breakdown } = calculateKplcBreakdown(payment.amount);

      // Update payment state
      payment.status = "completed";
      payment.tokenCode = token;
      payment.receiptNumber = receipt;

      if (meter) {
        meter.balanceKwh = Math.round((meter.balanceKwh + kwh) * 10) / 10;
        if (meter.balanceKwh > 15) meter.status = "active";
        else if (meter.balanceKwh > 5) meter.status = "warning";
        else meter.status = "low";

        // Also update corresponding rental unit current kWh
        const rental = rentalProperties.find(rp => rp.meterId === meter.id);
        if (rental) {
          rental.currentKwh = meter.balanceKwh;
          rental.lastPaymentDate = new Date().toISOString();
        }
      }

      // Record transaction
      const newTx: Transaction = {
        id: `t_${Date.now()}`,
        meterId: payment.meterId,
        meterNumber: meter ? meter.meterNumber : "000-000-000",
        meterNickname: meter ? meter.nickname : "Electricity Token",
        amount: payment.amount,
        kwh,
        tokenCode: token,
        timestamp: new Date().toISOString(),
        status: "completed",
        checkoutRequestId,
        receiptNumber: receipt,
        breakdown
      };
      
      transactions.unshift(newTx);
      
      console.log(`[Daraja API Callback] Payment successful for ${checkoutRequestId}. Generated token: ${token}`);
      res.json({ success: true, message: "Callback processed. Token delivered." });
    } else {
      // FAILED payment
      payment.status = "failed";
      
      // Record failed transaction
      const meter = meters.find(m => m.id === payment.meterId);
      const newTx: Transaction = {
        id: `t_${Date.now()}`,
        meterId: payment.meterId,
        meterNumber: meter ? meter.meterNumber : "000-000-000",
        meterNickname: meter ? meter.nickname : "Electricity Token",
        amount: payment.amount,
        kwh: 0,
        tokenCode: null,
        timestamp: new Date().toISOString(),
        status: "failed",
        checkoutRequestId,
        receiptNumber: "N/A",
        breakdown: calculateKplcBreakdown(payment.amount).breakdown
      };
      transactions.unshift(newTx);

      console.log(`[Daraja API Callback] Payment failed for ${checkoutRequestId}`);
      res.json({ success: true, message: "Callback processed as failed." });
    }
  });

  // Rental dashboard Endpoints
  app.get("/api/rental/properties", (req, res) => {
    // Sync actual meter balances before returning
    rentalProperties = rentalProperties.map(rp => {
      const meter = meters.find(m => m.id === rp.meterId);
      return {
        ...rp,
        currentKwh: meter ? meter.balanceKwh : rp.currentKwh
      };
    });
    res.json(rentalProperties);
  });

  app.post("/api/rental/notify-tenant", (req, res) => {
    const { propertyId } = req.body;
    const property = rentalProperties.find(rp => rp.id === propertyId);
    if (!property) {
      return res.status(404).json({ error: "Rental property not found" });
    }

    console.log(`[SMS Service] Sent warning to Tenant ${property.tenantName} (${property.tenantPhone}): 'Habari, KPLC meter ${property.meterNumber} has low balance of ${property.currentKwh} kWh. Please top up using UmemePay.'`);
    res.json({ success: true, message: `Notification successfully sent to ${property.tenantName}` });
  });

  // Family Endpoints
  app.get("/api/family/members", (req, res) => {
    res.json(familyMembers);
  });

  app.post("/api/family/members", (req, res) => {
    const { name, relation, phone, allowedMeters, spendingLimit } = req.body;
    if (!name || !relation || !phone) {
      return res.status(400).json({ error: "Name, relation, and phone are required" });
    }

    const newMember: FamilyMember = {
      id: `f_${Date.now()}`,
      name,
      relation,
      phone,
      avatarUrl: `https://images.unsplash.com/photo-${Math.floor(1500000000000 + Math.random() * 100000000000)}?auto=format&fit=crop&q=80&w=200`,
      allowedMeters: allowedMeters || [],
      spendingLimit: Number(spendingLimit) || 2000,
      spentThisMonth: 0
    };

    familyMembers.push(newMember);
    res.status(201).json(newMember);
  });

  app.delete("/api/family/members/:id", (req, res) => {
    const { id } = req.params;
    familyMembers = familyMembers.filter(m => m.id !== id);
    res.json({ success: true, message: "Family member removed" });
  });

  // ==================== VITE ENGINE MIDDLEWARE ====================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
