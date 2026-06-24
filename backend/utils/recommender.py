def get_recommendations(biomarkers):
    """
    Generates personalized diet, exercise, and lifestyle recommendations based on biomarker statuses.
    """
    recommendations = {
        "diet": [],
        "exercise": [],
        "lifestyle": []
    }
    
    # Track which conditions are flagged to avoid duplicate recommendations
    flagged = set()
    
    for bio in biomarkers:
        name = bio["name"]
        status = bio["status"]
        
        if status in ["High", "Low", "Borderline"]:
            if name in ["Fasting Glucose", "Postprandial Glucose", "HbA1c"]:
                if "sugar" not in flagged:
                    flagged.add("sugar")
                    if status == "High" or status == "Borderline":
                        recommendations["diet"].extend([
                            "Prioritize low-glycemic index foods such as oats, brown rice, quinoa, and non-starchy vegetables.",
                            "Strictly limit intake of refined sugars, carbonated beverages, sweets, and high-carb processed snacks.",
                            "Include a source of lean protein (chicken, fish, tofu, legumes) in every meal to stabilize blood glucose spikes."
                        ])
                        recommendations["exercise"].extend([
                            "Engage in at least 150 minutes of moderate-intensity aerobic exercise (e.g., brisk walking, cycling) per week.",
                            "Incorporate 2-3 sessions of strength training weekly; building muscle improves insulin sensitivity."
                        ])
                        recommendations["lifestyle"].extend([
                            "Monitor blood sugar levels regularly as advised by your healthcare provider.",
                            "Maintain a consistent meal schedule and manage stress, as cortisol (stress hormone) raises blood glucose levels."
                        ])
            
            elif name in ["Hemoglobin", "RBC"]:
                if "anemia" not in flagged:
                    flagged.add("anemia")
                    if status == "Low":
                        recommendations["diet"].extend([
                            "Increase intake of iron-rich foods: lean red meats, poultry, seafood, spinach, lentils, and fortified cereals.",
                            "Pair iron-rich foods with Vitamin C (e.g., citrus fruits, bell peppers, tomatoes) to significantly enhance absorption.",
                            "Limit drinking tea or coffee during or immediately after meals, as tannins inhibit iron absorption."
                        ])
                        recommendations["exercise"].extend([
                            "Engage in low-to-moderate physical activities (brisk walking, gentle stretching) but avoid extreme exertion while hemoglobin levels are low.",
                            "Take frequent breaks during workouts if you experience fatigue, dizziness, or shortness of breath."
                        ])
                        recommendations["lifestyle"].extend([
                            "Get 7-8 hours of quality sleep to combat physical fatigue.",
                            "Consult your physician regarding iron and Vitamin B12 supplements if dietary changes are insufficient."
                        ])
            
            elif name in ["Total Cholesterol", "LDL Cholesterol", "Triglycerides"]:
                if "cholesterol" not in flagged:
                    flagged.add("cholesterol")
                    if status == "High" or status == "Borderline":
                        recommendations["diet"].extend([
                            "Consume soluble fiber foods daily (oatmeal, kidney beans, Brussels sprouts, apples, pears) which help lower cholesterol absorption.",
                            "Reduce saturated fats found in butter, lard, cheese, fatty meats, and eliminate trans fats entirely.",
                            "Incorporate healthy fats rich in omega-3 fatty acids: olive oil, walnuts, flaxseeds, salmon, and mackerel."
                        ])
                        recommendations["exercise"].extend([
                            "Aim for 30-40 minutes of aerobic exercise (like jogging, swimming, or active sports) 4-5 times a week to help raise HDL ('good') cholesterol."
                        ])
                        recommendations["lifestyle"].extend([
                            "Maintain a healthy body weight; even a modest weight reduction (5-10%) can significantly lower LDL cholesterol.",
                            "Quit smoking (if applicable), as it improves HDL levels and reduces cardiovascular risk dramatically."
                        ])
            
            elif name == "HDL Cholesterol" and status == "Low":
                if "hdl" not in flagged:
                    flagged.add("hdl")
                    recommendations["diet"].extend([
                        "Use extra virgin olive oil as your primary culinary fat.",
                        "Incorporate purple-colored produce (eggplants, blueberries, purple cabbage) which contain anthocyanins that help boost HDL."
                    ])
                    recommendations["exercise"].extend([
                        "Prioritize high-intensity interval training (HIIT) or regular cardiovascular workouts, which are highly effective at elevating HDL."
                    ])
                    recommendations["lifestyle"].extend([
                        "Avoid a sedentary lifestyle; stand or walk for 5 minutes for every hour of sitting."
                    ])
            
            elif name in ["Systolic BP", "Diastolic BP"]:
                if "bp" not in flagged:
                    flagged.add("bp")
                    if status == "High" or status == "Borderline":
                        recommendations["diet"].extend([
                            "Adopt the DASH (Dietary Approaches to Stop Hypertension) diet, focusing on vegetables, fruits, and low-fat dairy.",
                            "Restrict sodium intake to under 1,500 - 2,000 mg per day. Avoid processed foods, canned soups, and adding extra table salt.",
                            "Incorporate potassium-rich foods (bananas, sweet potatoes, avocados, spinach) to help relax blood vessel walls."
                        ])
                        recommendations["exercise"].extend([
                            "Consistent aerobic physical activity (brisk walking 30 mins daily) is highly effective in lowering resting blood pressure."
                        ])
                        recommendations["lifestyle"].extend([
                            "Practice stress-reduction techniques such as deep breathing exercises, meditation, or yoga for 15 minutes daily.",
                            "Limit alcohol intake and measure blood pressure regularly in a calm state."
                        ])
                        
            elif name == "Thyroid TSH":
                if "thyroid" not in flagged:
                    flagged.add("thyroid")
                    if status == "High": # Hypothyroidism (underactive)
                        recommendations["diet"].extend([
                            "Ensure adequate intake of iodine (iodized salt) and selenium (brazil nuts, eggs, legumes).",
                            "Cook goitrogenic foods (cabbage, broccoli, kale) before consuming, as cooking inactivates goitrogens that interfere with thyroid function."
                        ])
                        recommendations["exercise"].extend([
                            "Perform regular moderate exercises (jogging, swimming) to stimulate metabolism, which is often slowed down by hypothyroidism."
                        ])
                        recommendations["lifestyle"].extend([
                            "Take thyroid medication (if prescribed) on an empty stomach at least 30-60 minutes before breakfast for optimal absorption."
                        ])
                    elif status == "Low": # Hyperthyroidism (overactive)
                        recommendations["diet"].extend([
                            "Include cruciferous vegetables (broccoli, cabbage, kale) as they can help reduce thyroid hormone production.",
                            "Limit excessive iodine intake (avoid seaweed, kelp, iodized supplements)."
                        ])
                        recommendations["exercise"].extend([
                            "Focus on strength training and bone-loading exercises (weight training), as hyperthyroidism can weaken bones."
                        ])
                        recommendations["lifestyle"].extend([
                            "Avoid caffeine and other stimulants that can worsen heart palpitations and anxiety associated with hyperthyroidism."
                        ])
                        
            elif name == "Creatinine" and status == "High":
                if "kidney" not in flagged:
                    flagged.add("kidney")
                    recommendations["diet"].extend([
                        "Reduce excessive protein intake, particularly from red meats, as protein metabolism produces creatinine.",
                        "Avoid creatine supplements.",
                        "Incorporate more dietary fiber from fruits, vegetables, and whole grains."
                    ])
                    recommendations["exercise"].extend([
                        "Avoid high-intensity weight training or heavy lifting, as intense muscle activity temporarily increases creatinine production.",
                        "Engage in light to moderate cardiorespiratory exercises."
                    ])
                    recommendations["lifestyle"].extend([
                        "Ensure proper hydration; drink 2.5 - 3 liters of water daily, unless fluid restriction is advised by a doctor.",
                        "Avoid NSAIDs (non-steroidal anti-inflammatory drugs like ibuprofen), which can cause kidney strain."
                    ])

    # Default healthy living recommendations if no critical abnormalities are found
    if not flagged:
        recommendations["diet"].extend([
            "Maintain a balanced diet rich in whole foods, vegetables, fruits, lean proteins, and healthy fats.",
            "Stay well-hydrated by drinking at least 8-10 glasses of water daily.",
            "Practice portion control and minimize late-night heavy meals."
        ])
        recommendations["exercise"].extend([
            "Engage in at least 150 minutes of moderate physical activity or 75 minutes of vigorous exercise weekly.",
            "Include regular stretching and flexibility workouts to improve joint health."
        ])
        recommendations["lifestyle"].extend([
            "Aim for 7-9 hours of restful sleep every night.",
            "Practice mindfulness or meditation to manage daily stress.",
            "Schedule annual comprehensive health check-ups."
        ])
        
    return recommendations
