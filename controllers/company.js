const Company = require("../models/Company");

const companyRegister = async (req, res) => {
  const {
    CompanyCode,
    password,
    CompanyName,
    CompanyEmail,
    CompanyAddress,
    CompanyPhone,
    website,
    taxOffice,
    taxId,
    tradeRegistryNumber,
  } = req.body;

  try {
    const company = new Company({
      CompanyCode,
      password,
      CompanyName,
      CompanyEmail,
      CompanyAddress,
      CompanyPhone,
      website,
      taxOffice,
      taxId,
      tradeRegistryNumber,
    });

    await company.save();

    res.status(201).json({ message: "Şirket başarıyla oluşturuldu.", company });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası.", error: error.message });
  }
};

const companyLogin = async (req, res, next) => {
  const { CompanyCode, password } = req.body;
  try {
    const company = await Company.findOne({ CompanyCode });

    if (!company) {
      return res
        .status(401)
        .json({ message: "Geçersiz Şirket Kodu veya Parola" });
    }

    const isPasswordCorrect = await company.comparePassword(password);

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Geçersiz Şirket Kodu veya Parola" });
    }

    res.status(200).json({ message: "Giriş başarılı", company });
  } catch (error) {
    next(error);
  }
};

module.exports = { companyRegister, companyLogin };
