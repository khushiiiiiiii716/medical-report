export const DEFAULT_PROFILE = {
  name: "John Doe",
  age: 35,
  gender: "Male",
  height: 175,
  weight: 78,
  bmi: 25.5,
  smoking: false,
  exercise: true,
  family_history_diabetes: true,
  family_history_heart: false
};

export const MOCK_REPORTS = [
  {
    id: 101,
    filename: "Metropolis_Lab_Report_June_2026.pdf",
    upload_date: "2026-06-20T10:15:30Z",
    health_score: 75,
    risks: {
      diabetes: 52.4,
      heart_disease: 42.1,
      anemia: 68.2
    },
    biomarkers: [
      {
        name: "Hemoglobin",
        category: "Complete Blood Count",
        value: 11.5,
        unit: "g/dL",
        reference_range: "13.8 - 17.2",
        status: "Low",
        description: "A protein in red blood cells that carries oxygen throughout the body."
      },
      {
        name: "RBC",
        category: "Complete Blood Count",
        value: 4.3,
        unit: "million/mcL",
        reference_range: "4.5 - 5.9",
        status: "Low",
        description: "Red Blood Cells, which carry oxygen. Low levels can indicate anemia."
      },
      {
        name: "WBC",
        category: "Complete Blood Count",
        value: 7200,
        unit: "cells/mcL",
        reference_range: "4000 - 11000",
        status: "Normal",
        description: "White Blood Cells, part of the immune system. High levels can indicate infection."
      },
      {
        name: "Platelets",
        category: "Complete Blood Count",
        value: 250000,
        unit: "cells/mcL",
        reference_range: "150000 - 450000",
        status: "Normal",
        description: "Cells that help blood clot. Low levels increase bleeding risk; high levels increase clotting risk."
      },
      {
        name: "Fasting Glucose",
        category: "Blood Sugar",
        value: 112,
        unit: "mg/dL",
        reference_range: "70 - 100 (Borderline to 125)",
        status: "Borderline",
        description: "Blood sugar level measured after fasting. Key indicator for diabetes."
      },
      {
        name: "Postprandial Glucose",
        category: "Blood Sugar",
        value: 145,
        unit: "mg/dL",
        reference_range: "70 - 140 (Borderline to 199)",
        status: "Borderline",
        description: "Blood sugar level measured 2 hours after a meal."
      },
      {
        name: "HbA1c",
        category: "Blood Sugar",
        value: 6.1,
        unit: "%",
        reference_range: "4.0 - 5.6 (Borderline to 6.4)",
        status: "Borderline",
        description: "Average blood sugar level over the past 3 months. Used to diagnose diabetes."
      },
      {
        name: "Total Cholesterol",
        category: "Lipid Profile",
        value: 245,
        unit: "mg/dL",
        reference_range: "100 - 200 (Borderline to 239)",
        status: "High",
        description: "Total amount of cholesterol in your blood. High levels increase heart disease risk."
      },
      {
        name: "LDL Cholesterol",
        category: "Lipid Profile",
        value: 142,
        unit: "mg/dL",
        reference_range: "0 - 100 (Borderline to 129)",
        status: "High",
        description: "Low-Density Lipoprotein ('bad' cholesterol). Excess causes plaque buildup in arteries."
      },
      {
        name: "HDL Cholesterol",
        category: "Lipid Profile",
        value: 38,
        unit: "mg/dL",
        reference_range: "40 - 80",
        status: "Low",
        description: "High-Density Lipoprotein ('good' cholesterol). Helps remove other forms of cholesterol."
      },
      {
        name: "Triglycerides",
        category: "Lipid Profile",
        value: 185,
        unit: "mg/dL",
        reference_range: "0 - 150 (Borderline to 199)",
        status: "Borderline",
        description: "A type of fat in the blood. High levels linked to cardiovascular disease risk."
      },
      {
        name: "Thyroid TSH",
        category: "Thyroid Profile",
        value: 3.2,
        unit: "mIU/L",
        reference_range: "0.4 - 4.5",
        status: "Normal",
        description: "Thyroid Stimulating Hormone. Controls metabolism. High means underactive thyroid; low means overactive."
      },
      {
        name: "Creatinine",
        category: "Renal Profile",
        value: 0.85,
        unit: "mg/dL",
        reference_range: "0.7 - 1.3",
        status: "Normal",
        description: "A waste product filtered by the kidneys. High levels indicate impaired kidney function."
      },
      {
        name: "Systolic BP",
        category: "Cardiovascular",
        value: 135,
        unit: "mmHg",
        reference_range: "90 - 120 (Borderline to 129)",
        status: "High",
        description: "Pressure in arteries when the heart beats. Top number in blood pressure readings."
      },
      {
        name: "Diastolic BP",
        category: "Cardiovascular",
        value: 85,
        unit: "mmHg",
        reference_range: "60 - 80 (Borderline to 89)",
        status: "Borderline",
        description: "Pressure in arteries between heartbeats. Bottom number in blood pressure readings."
      }
    ],
    recommendations: {
      diet: [
        "Increase intake of iron-rich foods: lean red meats, poultry, spinach, lentils, and fortified cereals.",
        "Pair iron-rich foods with Vitamin C (citrus fruits, bell peppers) to boost absorption.",
        "Strictly limit intake of refined sugars, sweets, and high-carb processed snacks to lower glucose.",
        "Consume soluble fiber foods daily (oatmeal, kidney beans, apples) which help lower cholesterol.",
        "Adopt the DASH diet, focusing on vegetables, fruits, and low-fat dairy.",
        "Restrict sodium (salt) intake to under 1,500 mg per day. Avoid processed foods."
      ],
      exercise: [
        "Engage in at least 150 minutes of moderate-intensity cardio (brisk walking, swimming) per week.",
        "Incorporate 2-3 sessions of light strength training weekly; building muscle improves insulin sensitivity.",
        "Consistent aerobic exercise is highly effective in lowering resting blood pressure."
      ],
      lifestyle: [
        "Get 7-8 hours of quality sleep to combat physical fatigue.",
        "Consult your physician regarding iron supplements if dietary changes are insufficient.",
        "Monitor blood sugar and blood pressure levels regularly in a calm state.",
        "Practice stress-reduction techniques (meditation, deep breathing) for 15 minutes daily."
      ]
    }
  },
  {
    id: 100,
    filename: "Metropolis_Lab_Report_December_2025.pdf",
    upload_date: "2025-12-15T09:30:00Z",
    health_score: 82,
    risks: {
      diabetes: 45.1,
      heart_disease: 38.6,
      anemia: 40.2
    },
    biomarkers: [
      {
        name: "Hemoglobin",
        category: "Complete Blood Count",
        value: 12.8,
        unit: "g/dL",
        reference_range: "13.8 - 17.2",
        status: "Low",
        description: "A protein in red blood cells that carries oxygen throughout the body."
      },
      {
        name: "Fasting Glucose",
        category: "Blood Sugar",
        value: 105,
        unit: "mg/dL",
        reference_range: "70 - 100",
        status: "Borderline",
        description: "Blood sugar level measured after fasting. Key indicator for diabetes."
      },
      {
        name: "Total Cholesterol",
        category: "Lipid Profile",
        value: 215,
        unit: "mg/dL",
        reference_range: "100 - 200",
        status: "Borderline",
        description: "Total amount of cholesterol in your blood. High levels increase heart disease risk."
      },
      {
        name: "Systolic BP",
        category: "Cardiovascular",
        value: 128,
        unit: "mmHg",
        reference_range: "90 - 120",
        status: "Borderline",
        description: "Pressure in arteries when the heart beats. Top number in blood pressure readings."
      },
      {
        name: "Diastolic BP",
        category: "Cardiovascular",
        value: 82,
        unit: "mmHg",
        reference_range: "60 - 80",
        status: "Borderline",
        description: "Pressure in arteries between heartbeats. Bottom number in blood pressure readings."
      }
    ],
    recommendations: {
      diet: [
        "Include more spinach, lentils, and iron-fortified cereals.",
        "Limit refined sugars and processed carbs.",
        "Minimize salt and processed food consumption."
      ],
      exercise: [
        "Engage in 30 minutes of brisk walking 5 times a week."
      ],
      lifestyle: [
        "Practice meditation or yoga for stress relief.",
        "Ensure consistent sleep schedule."
      ]
    }
  }
];

export const MOCK_TRENDS = [
  { date: "2025-12-15", filename: "Metropolis_Lab_Report_December_2025.pdf", Hemoglobin: 12.8, "Fasting Glucose": 105, "Total Cholesterol": 215, "Systolic BP": 128, "Diastolic BP": 82 },
  { date: "2026-06-20", filename: "Metropolis_Lab_Report_June_2026.pdf", Hemoglobin: 11.5, "Fasting Glucose": 112, "Total Cholesterol": 245, "Systolic BP": 135, "Diastolic BP": 85 }
];
