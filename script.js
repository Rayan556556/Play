// بيانات اللعبة الأساسية
let village = {
  name: "غير محدد",
  resources: {
    wood: 100,
    gold: 500,
    food: 100,
    iron: 100,
    elixir: 0,
  },
  population: 100,
  births: 0,
  deaths: 0,
  buildings: {
    farm: 0,
    mine: 0,
    barracks: 0,
    hospital: 0,
    gym: 0,
    ryan: 0,
  },
  soldiers: {
    archer: 0,
    knight: 0,
    reserve: 0,
  },
  defenses: {
    tower: 0,
    wall: 0,
  },
  boosterLevel: 0,
  skin: 'default',
  governorateBought: false,
  armyPower: 0,
  defensePower: 0,
  weaponsOwned: {
    sword: 0,
    shield: 0,
    bow: 0,
    reserveWeapon: 0,
  },
  selectedStrategy: 'balanced',
  selectedAttackAbility: null,
  quests: [],
};

// بيانات الاستراتيجيات
const strategies = {
  balanced: { attackBoost: 1.0, defenseBoost: 1.0 },
  aggressive: { attackBoost: 1.3, defenseBoost: 0.7 },
  defensive: { attackBoost: 0.7, defenseBoost: 1.3 },
};

// بيانات الأسلحة
const weapons = {
  sword: { attack: 10, defense: 2, price: 50 },
  shield: { attack: 2, defense: 10, price: 50 },
  bow: { attack: 15, defense: 1, price: 75 },
  reserveWeapon: { attack: 0, defense: 0, price: 2 },
};

// بيانات قدرات المهاجم
const attackAbilities = {
  storm: { name: "العاصفة", attackBoost: 1.5, cost: { gold: 200, elixir: 2 } },
  fireArrow: { name: "السهم الناري", defenseReduction: 0.2, cost: { gold: 150, elixir: 1 } },
};

// بيانات قدرات المدافع
const defenseAbilities = {
  magicShield: { name: "الدرع السحري", defenseBoost: 1.3, cost: { gold: 100, elixir: 1 } },
  wallRepair: { name: "إصلاح الجدار", defenseRestore: 0.1, cost: { gold: 50, elixir: 0 } },
};

// بيانات المهمات
const availableQuests = [
  {
    id: 'build_farms',
    description: 'ابنِ 3 مزارع',
    condition: () => village.buildings.farm >= 3,
    reward: { gold: 300, elixir: 1 },
  },
  {
    id: 'train_soldiers',
    description: 'درّب 50 جندي احتياطي',
    condition: () => village.soldiers.reserve >= 50,
    reward: { gold: 500, iron: 100 },
  },
  {
    id: 'attack_village',
    description: 'هاجم دولة بقوة دفاعية 2000 على الأقل',
    condition: () => false, // سيتم تحديثه في دالة endBattle
    reward: { gold: 1000, elixir: 2 },
  },
];

// معدلات الإنتاج الأساسية
const productionRates = {
  farm: 10,
  mine: 15,
  boosterMultiplier: 1.5,
};

// وقت تحديث الموارد
const productionInterval = 10000;

// تحديث عرض الموارد في الصفحة
function updateResources() {
  const elements = {
    wood: document.getElementById("wood"),
    gold: document.getElementById("gold"),
    food: document.getElementById("food"),
    iron: document.getElementById("iron"),
    elixir: document.getElementById("elixir"),
    population: document.getElementById("population-count"),
    births: document.getElementById("births"),
    deaths: document.getElementById("deaths"),
    boosterLevel: document.getElementById("booster-level"),
    boosterCost: document.getElementById("booster-cost"),
    armyPower: document.getElementById("army-power"),
    defensePower: document.getElementById("defense-power"),
  };

  if (elements.wood) elements.wood.textContent = Math.max(0, village.resources.wood.toFixed(0));
  if (elements.gold) elements.gold.textContent = Math.max(0, village.resources.gold.toFixed(0));
  if (elements.food) elements.food.textContent = Math.max(0, village.resources.food.toFixed(0));
  if (elements.iron) elements.iron.textContent = Math.max(0, village.resources.iron.toFixed(0));
  if (elements.elixir) elements.elixir.textContent = Math.max(0, village.resources.elixir.toFixed(0));
  if (elements.population) elements.population.textContent = Math.max(0, village.population.toFixed(0));
  if (elements.births) elements.births.textContent = village.births.toFixed(2);
  if (elements.deaths) elements.deaths.textContent = village.deaths.toFixed(2);
  if (elements.boosterLevel) elements.boosterLevel.textContent = village.boosterLevel;
  if (elements.boosterCost) elements.boosterCost.textContent = 500 * (village.boosterLevel + 1);
  if (elements.armyPower) elements.armyPower.textContent = village.armyPower.toFixed(0);
  if (elements.defensePower) elements.defensePower.textContent = village.defensePower.toFixed(0);

  updateQuests();
}

// تغيير اسم الدولة
function setVillageName() {
  const input = document.getElementById("village-name-input");
  if (!input || input.value.trim() === "") {
    return alert("يرجى إدخال اسم صحيح للدولة.");
  }
  village.name = input.value.trim();
  const display = document.getElementById("village-name-display");
  if (display) display.textContent = village.name;
  input.value = "";
}

// رفع صورة الدولة
const villageImageInput = document.getElementById("village-image-input");
if (villageImageInput) {
  villageImageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = document.getElementById("village-image-display");
    if (!img) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
      img.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}

// بناء مبانٍ
function build(building) {
  const costs = {
    farm: { wood: 100 },
    mine: { gold: 150 },
    barracks: { iron: 200 },
    hospital: { gold: 300 },
    gym: { gold: 200 },
    ryan: { gold: 500 },
  };

  const cost = costs[building];
  if (!cost) return alert("هذا المبنى غير متوفر.");

  for (const resource in cost) {
    if (village.resources[resource] < cost[resource]) {
      return alert(`ليس لديك ما يكفي من ${resource} لبناء ${building}`);
    }
  }

  for (const resource in cost) {
    village.resources[resource] = Math.max(0, village.resources[resource] - cost[resource]);
  }

  village.buildings[building]++;
  updateArmyAndDefensePower();
  alert(`تم بناء ${building} بنجاح! لديك الآن ${village.buildings[building]} من هذا المبنى.`);
  updateResources();
}

// تدريب الجنود
function trainSoldier(type) {
  const costs = {
    archer: { food: 50, time: 10000 },
    knight: { iron: 100, time: 20000 },
    reserve: { food: 2, time: 5000 },
  };

  const cost = costs[type];
  if (!cost) return alert("نوع الجندي غير معروف.");

  if (village.resources.food < (cost.food || 0) || village.resources.iron < (cost.iron || 0)) {
    return alert("ليس لديك ما يكفي من الموارد لتدريب هذا الجندي.");
  }

  village.resources.food = Math.max(0, village.resources.food - (cost.food || 0));
  village.resources.iron = Math.max(0, village.resources.iron - (cost.iron || 0));
  updateResources();

  alert(`جارٍ تدريب ${type}... الانتظار ${cost.time / 1000} ثواني`);

  setTimeout(() => {
    village.soldiers[type]++;
    if (type === "reserve") {
      village.weaponsOwned.reserveWeapon++;
    }
    updateArmyAndDefensePower();
    alert(`${type} تدرب بنجاح! لديك الآن ${village.soldiers[type]} من هذا النوع.`);
  }, cost.time / (1 + 0.5 * village.boosterLevel));
}

// بناء دفاعات
function buildDefense(type) {
  const costs = {
    tower: { wood: 200 },
    wall: { iron: 150 },
  };

  const cost = costs[type];
  if (!cost) return alert("نوع الدفاع غير معروف.");

  for (const resource in cost) {
    if (village.resources[resource] < cost[resource]) {
      return alert(`ليس لديك ما يكفي من ${resource} لبناء ${type}`);
    }
  }

  for (const resource in cost) {
    village.resources[resource] = Math.max(0, village.resources[resource] - cost[resource]);
  }

  village.defenses[type]++;
  updateArmyAndDefensePower();
  alert(`تم بناء ${type} بنجاح! لديك الآن ${village.defenses[type]} من هذا الدفاع.`);
  updateResources();
}

// تجهيز الاحتياطيات بالأسلحة
function equipReserveWeapon(weapon) {
  if (!weapons[weapon] || weapon === "reserveWeapon") return alert("السلاح غير متوفر.");
  if (village.soldiers.reserve <= village.weaponsOwned.sword + village.weaponsOwned.shield + village.weaponsOwned.bow) {
    return alert("ليس لديك احتياطيات كافية لتجهيز سلاح إضافي.");
  }
  if (village.resources.gold < weapons[weapon].price) {
    return alert(`ليس لديك ما يكفي من الذهب لشراء ${weapon}`);
  }

  village.resources.gold = Math.max(0, village.resources.gold - weapons[weapon].price);
  village.weaponsOwned[weapon]++;
  village.weaponsOwned.reserveWeapon = Math.max(0, village.weaponsOwned.reserveWeapon - 1);
  updateArmyAndDefensePower();
  alert(`تم تجهيز الاحتياطيات بسلاح ${weapon}!`);
  updateResources();
}

// اختيار استراتيجية
function buyStrategy(type, strategy) {
  if (village.resources.gold < 1000) {
    return alert("ليس لديك ما يكفي من الذهب لشراء هذه الاستراتيجية.");
  }
  village.resources.gold = Math.max(0, village.resources.gold - 1000);
  village.selectedStrategy = strategy;
  updateArmyAndDefensePower();
  alert(`تم اختيار استراتيجية ${strategy} (${type}) بنجاح!`);
  updateResources();
}

// شراء مسرع الإنتاج
function buyBooster() {
  const cost = 500 * (village.boosterLevel + 1);
  if (village.resources.gold < cost) {
    return alert(`ليس لديك ما يكفي من الذهب. تكلفة المسرع هي ${cost} ذهب.`);
  }
  village.resources.gold = Math.max(0, village.resources.gold - cost);
  village.boosterLevel++;
  updateArmyAndDefensePower();
  alert(`تم شراء مسرع الإنتاج! مستواك الآن: ${village.boosterLevel}`);
  updateResources();
}

// تحويل الإكسير إلى ذهب
function convertElixirToGold() {
  if (village.resources.elixir < 1) {
    return alert("ليس لديك إكسير للتحويل.");
  }
  village.resources.elixir = Math.max(0, village.resources.elixir - 1);
  village.resources.gold += 100;
  alert("تم تحويل 1 إكسير إلى 100 ذهب.");
  updateResources();
}

// تحويل الذهب إلى إكسير
function convertGoldToElixir() {
  if (village.resources.gold < 100) {
    return alert("ليس لديك ذهب كافي للتحويل.");
  }
  village.resources.gold = Math.max(0, village.resources.gold - 100);
  village.resources.elixir++;
  alert("تم تحويل 100 ذهب إلى 1 إكسير.");
  updateResources();
}

// اختيار قدرة هجومية
function selectAttackAbility(ability) {
  const cost = attackAbilities[ability].cost;
  if (village.resources.gold < cost.gold || village.resources.elixir < cost.elixir) {
    return alert(`ليس لديك ما يكفي من الموارد لاستخدام ${attackAbilities[ability].name}.`);
  }
  village.resources.gold = Math.max(0, village.resources.gold - cost.gold);
  village.resources.elixir = Math.max(0, village.resources.elixir - cost.elixir);
  village.selectedAttackAbility = ability;
  alert(`تم اختيار قدرة ${attackAbilities[ability].name} للهجوم القادم!`);
  updateResources();
}

// شاشة القتال البكسلية
let battleCanvas = document.getElementById("battle-canvas");
let battleCtx = battleCanvas ? battleCanvas.getContext("2d") : null;
let battleState = {
  attackerUnits: [],
  defenderUnits: [],
  round: 0,
  maxRounds: 5,
  defenderPower: 0,
  attackerPower: 0,
  lastEnemyDefensePower: 0, // لتتبع قوة العدو للمهمات
};

// تهيئة المعركة
function initializeBattle(enemyDefensePower) {
  if (!battleCanvas || !battleCtx) return;

  battleState.attackerUnits = [];
  battleState.defenderUnits = [];
  battleState.round = 0;
  battleState.defenderPower = enemyDefensePower;
  battleState.attackerPower = village.armyPower * (strategies[village.selectedStrategy]?.attackBoost || 1.0);
  battleState.lastEnemyDefensePower = enemyDefensePower;

  if (village.selectedAttackAbility) {
    const ability = attackAbilities[village.selectedAttackAbility];
    if (ability.attackBoost) {
      battleState.attackerPower *= ability.attackBoost;
    }
    if (ability.defenseReduction) {
      battleState.defenderPower *= (1 - ability.defenseReduction);
    }
    village.selectedAttackAbility = null;
  }

  // إنشاء وحدات بكسلية
  const totalSoldiers = village.soldiers.archer + village.soldiers.knight + village.soldiers.reserve;
  for (let i = 0; i < Math.min(totalSoldiers, 20); i++) {
    battleState.attackerUnits.push({ x: 50 + Math.random() * 100, y: 50 + Math.random() * 100, alive: true });
  }
  for (let i = 0; i < Math.min(enemyDefensePower / 100, 20); i++) {
    battleState.defenderUnits.push({ x: 250 + Math.random() * 100, y: 50 + Math.random() * 100, alive: true });
  }

  drawBattle();
  battleCanvas.addEventListener("click", handleBattleClick);
  simulateBattle();
}

// رسم المعركة
function drawBattle() {
  if (!battleCtx || !battleCanvas) return;

  battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
  battleCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
  battleCtx.fillRect(0, 0, battleCanvas.width, battleCanvas.height);

  battleCtx.fillStyle = "red";
  for (const unit of battleState.attackerUnits) {
    if (unit.alive) {
      battleCtx.fillRect(unit.x, unit.y, 10, 10);
    }
  }

  battleCtx.fillStyle = "blue";
  for (const unit of battleState.defenderUnits) {
    if (unit.alive) {
      battleCtx.fillRect(unit.x, unit.y, 10, 10);
    }
  }

  battleCtx.fillStyle = "white";
  battleCtx.font = "16px Arial";
  battleCtx.fillText(`الهجوم: ${battleState.attackerPower.toFixed(0)}`, 10, 20);
  battleCtx.fillText(`الدفاع: ${battleState.defenderPower.toFixed(0)}`, 300, 20);
  battleCtx.fillText(`الجولة: ${battleState.round}/${battleState.maxRounds}`, 180, 20);
}

// التعامل مع النقر على الكانفس لتفعيل قدرات المدافع
function handleBattleClick(event) {
  const rect = battleCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let abilityOptions = "اختر قدرة دفاعية:\n";
  for (const key in defenseAbilities) {
    const ability = defenseAbilities[key];
    abilityOptions += `${key}: ${ability.name} (${ability.cost.gold} ذهب, ${ability.cost.elixir} إكسير)\n`;
  }
  const choice = prompt(abilityOptions + "\nأدخل اسم القدرة (magicShield أو wallRepair):");

  if (choice && defenseAbilities[choice]) {
    const ability = defenseAbilities[choice];
    if (village.resources.gold < ability.cost.gold || village.resources.elixir < ability.cost.elixir) {
      alert(`ليس لديك ما يكفي من الموارد لاستخدام ${ability.name}.`);
      return;
    }
    village.resources.gold = Math.max(0, village.resources.gold - ability.cost.gold);
    village.resources.elixir = Math.max(0, village.resources.elixir - ability.cost.elixir);

    if (ability.defenseBoost) {
      battleState.defenderPower *= ability.defenseBoost;
      alert(`تم تفعيل ${ability.name}! زادت القوة الدفاعية بنسبة ${((ability.defenseBoost - 1) * 100).toFixed(0)}%.`);
    } else if (ability.defenseRestore) {
      battleState.defenderPower += battleState.defenderPower * ability.defenseRestore;
      alert(`تم تفعيل ${ability.name}! تم استعادة ${(ability.defenseRestore * 100).toFixed(0)}% من القوة الدفاعية.`);
    }
    updateResources();
    drawBattle();
  } else if (choice) {
    alert("قدرة غير صالحة.");
  }
}

// محاكاة المعركة
function simulateBattle() {
  if (battleState.round >= battleState.maxRounds) {
    endBattle();
    return;
  }

  battleState.round++;
  const damageToDefender = battleState.attackerPower / battleState.maxRounds;
  const damageToAttacker = battleState.defenderPower / battleState.maxRounds;

  battleState.defenderPower = Math.max(0, battleState.defenderPower - damageToDefender);
  battleState.attackerPower = Math.max(0, battleState.attackerPower - damageToAttacker);

  for (const unit of battleState.attackerUnits) {
    if (Math.random() < damageToAttacker / battleState.attackerPower && unit.alive) {
      unit.alive = false;
    }
  }
  for (const unit of battleState.defenderUnits) {
    if (Math.random() < damageToDefender / battleState.defenderPower && unit.alive) {
      unit.alive = false;
    }
  }

  drawBattle();
  setTimeout(simulateBattle, 1000);
}

// إنهاء المعركة
function endBattle() {
  battleCanvas.removeEventListener("click", handleBattleClick);
  if (battleState.attackerPower > battleState.defenderPower) {
    const loot = Math.floor(battleState.defenderPower * 0.5);
    village.resources.gold += loot;
    if (battleState.lastEnemyDefensePower >= 2000) {
      const quest = village.quests.find(q => q.id === 'attack_village');
      if (quest) quest.completed = true;
    }
    alert(`فوز! هاجمت دولة بقوة دفاعية ${battleState.lastEnemyDefensePower.toFixed(0)}. حصلت على ${loot} ذهب.`);
  } else {
    alert(`خسارة! قوتك الهجومية (${battleState.attackerPower.toFixed(0)}) أقل من القوة الدفاعية (${battleState.defenderPower.toFixed(0)}).`);
  }
  updateResources();
  battleCtx.clearRect(0, 0, battleCanvas.width, battleCanvas.height);
}

// هجوم الدولة
function attackVillage() {
  const totalSoldiers = village.soldiers.archer + village.soldiers.knight + village.soldiers.reserve;
  if (totalSoldiers < 100) {
    return alert("ليس لديك 100 جندي على الأقل للهجوم.");
  }

  const enemyVillage = {
    defensePower: Math.floor(Math.random() * 5000) + 1000,
  };

  initializeBattle(enemyVillage.defensePower);
}

// توليد كود الدولة
function generateVillageCode() {
  const data = JSON.stringify(village);
  const encoded = btoa(unescape(encodeURIComponent(data)));
  const textarea = document.getElementById("village-code-display");
  if (textarea) textarea.value = encoded;
}

// نسخ الكود
function copyVillageCode() {
  const textarea = document.getElementById("village-code-display");
  if (!textarea) return alert("خطأ: حقل الكود غير موجود.");
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  document.execCommand("copy");
  alert("تم نسخ كود الدولة.");
}

// تحميل الدولة من كود
function loadVillage() {
  const input = document.getElementById("village-code-input");
  if (!input || !input.value.trim()) return alert("يرجى إدخال كود الدولة.");

  try {
    const decoded = atob(input.value.trim());
    const obj = JSON.parse(decoded);
    if (obj.name && obj.resources) {
      village = obj;
      const display = document.getElementById("village-name-display");
      if (display) display.textContent = village.name;
      updateArmyAndDefensePower();
      alert("تم تحميل الدولة بنجاح!");
      updateResources();
    } else {
      alert("الكود غير صالح.");
    }
  } catch {
    alert("الكود غير صالح أو تالف.");
  }
}

// استخدام كود الموارد
function useResourceCode() {
  const input = document.getElementById("resource-code-input");
  if (!input || !input.value.trim()) return alert("يرجى إدخال كود الموارد.");

  try {
    const decoded = atob(input.value.trim());
    const obj = JSON.parse(decoded);
    if (obj.resources) {
      village.resources = obj.resources;
      alert("تم تحديث الموارد بنجاح!");
      updateResources();
    } else {
      alert("كود الموارد غير صالح.");
    }
  } catch {
    alert("الكود غير صالح أو تالف.");
  }
}

// استخدام كود المعركة
function useBattleCode() {
  const input = document.getElementById("battle-code-input");
  if (!input || !input.value.trim()) return alert("يرجى إدخال كود المعركة.");

  try {
    const decoded = atob(input.value.trim());
    const obj = JSON.parse(decoded);
    if (obj.defensePower) {
      initializeBattle(obj.defensePower);
    } else {
      alert("كود المعركة غير صالح.");
    }
  } catch {
    alert("الكود غير صالح أو تالف.");
  }
}

// شراء سكن
function buySkin(skin) {
  const costMap = {
    blue: 100,
    black: 100,
    premium: 5000,
  };

  const cost = costMap[skin];
  if (!cost) return alert("السكن غير متوفر.");

  if (village.resources.gold < cost) {
    return alert("ليس لديك ما يكفي من الذهب لشراء هذا السكن.");
  }

  village.resources.gold = Math.max(0, village.resources.gold - cost);
  village.skin = skin;

  let bgColor = "white";
  if (skin === "blue") bgColor = "#007BFF";
  else if (skin === "black") bgColor = "#222";
  else if (skin === "premium") bgColor = "gold";

  document.body.style.backgroundColor = bgColor;
  alert(`تم شراء سكن ${skin} وتغيير الخلفية.`);
  updateResources();
}

// شراء المحافظة
function buyGovernorate() {
  if (village.governorateBought) {
    return alert("لقد اشتريت المحافظة مسبقًا.");
  }

  const cost = 100000;
  const totalResources = Object.values(village.resources).reduce((a, b) => a + b, 0);

  if (totalResources < cost) {
    return alert("ليس لديك موارد كافية لشراء المحافظة.");
  }

  const ratio = cost / totalResources;
  for (const key in village.resources) {
    village.resources[key] = Math.floor(Math.max(0, village.resources[key] * (1 - ratio)));
  }

  village.governorateBought = true;
  updateArmyAndDefensePower();
  alert("تم شراء المحافظة بنجاح!");
  updateResources();
}

// الزراعة على الكانفس
let farmCanvas = document.getElementById("farm-canvas");
let farmCtx = farmCanvas ? farmCanvas.getContext("2d") : null;
let trees = [];

function plantTree() {
  if (village.resources.food < 10) return alert("ليس لديك طعام كافي لزراعة شجرة.");
  village.resources.food = Math.max(0, village.resources.food - 10);

  if (farmCanvas && farmCtx) {
    const x = Math.random() * farmCanvas.width;
    const y = Math.random() * farmCanvas.height;
    trees.push({ x, y });
    drawFarm();
  }

  updateResources();
}

function cutTree() {
  if (trees.length === 0) return alert("لا توجد أشجار لقطعها.");
  trees.pop();
  village.resources.wood += 50;
  drawFarm();
  updateResources();
}

function drawFarm() {
  if (farmCtx && farmCanvas) {
    farmCtx.clearRect(0, 0, farmCanvas.width, farmCanvas.height);
    farmCtx.fillStyle = "green";
    for (const tree of trees) {
      farmCtx.beginPath();
      farmCtx.arc(tree.x, tree.y, 5, 0, 2 * Math.PI);
      farmCtx.fill();
    }
  }
}

// تحديث القوة الهجومية والدفاعية
function updateArmyAndDefensePower() {
  let attackPower = 0;
  let defensePower = 0;

  attackPower += village.soldiers.archer * weapons.bow.attack;
  defensePower += village.soldiers.archer * weapons.bow.defense;

  attackPower += village.soldiers.knight * weapons.sword.attack;
  defensePower += village.soldiers.knight * weapons.sword.defense;

  attackPower += village.soldiers.reserve * (
    village.weaponsOwned.sword * weapons.sword.attack +
    village.weaponsOwned.shield * weapons.shield.attack +
    village.weaponsOwned.bow * weapons.bow.attack +
    village.weaponsOwned.reserveWeapon * weapons.reserveWeapon.attack
  );
  defensePower += village.soldiers.reserve * (
    village.weaponsOwned.sword * weapons.sword.defense +
    village.weaponsOwned.shield * weapons.shield.defense +
    village.weaponsOwned.bow * weapons.bow.defense +
    village.weaponsOwned.reserveWeapon * weapons.reserveWeapon.defense
  );

  defensePower += village.defenses.tower * 50;
  defensePower += village.defenses.wall * 30;
  defensePower += village.buildings.hospital * 20;
  defensePower += village.buildings.gym * 10;
  attackPower += village.buildings.mine * 5;
  attackPower += village.buildings.farm * 3;
  attackPower += village.buildings.barracks * 50;
  attackPower += village.buildings.ryan * 100;
  defensePower += village.buildings.ryan * 50;

  if (village.governorateBought) {
    attackPower += 500;
    defensePower += 300;
  }

  attackPower *= (1 + village.boosterLevel * 0.1);
  defensePower *= (1 + village.boosterLevel * 0.1);

  village.armyPower = Math.floor(Math.max(0, attackPower));
  village.defensePower = Math.floor(Math.max(0, defensePower));

  updateResources();
}

// إنتاج الموارد
function produceResources() {
  const farms = village.buildings.farm;
  const mines = village.buildings.mine;
  const booster = village.boosterLevel;

  village.resources.food += farms * productionRates.farm * (productionRates.boosterMultiplier ** booster);
  village.resources.gold += mines * productionRates.mine * (productionRates.boosterMultiplier ** booster);
  village.resources.iron += mines * 2 * (productionRates.boosterMultiplier ** booster);
  village.resources.wood += trees.length * 2 * (productionRates.boosterMultiplier ** booster);

  village.births = village.buildings.hospital * 0.1 * (productionRates.boosterMultiplier ** booster);
  village.deaths = Math.max(0, 0.05 - village.buildings.hospital * 0.01);
  village.population = Math.max(0, village.population + (village.births - village.deaths) * (productionRates.boosterMultiplier ** booster));

  updateResources();
}

// نظام المحادثة
function encodeMessage() {
  const input = document.getElementById("chat-input");
  const output = document.getElementById("chat-code-display");
  if (!input || !input.value.trim()) return alert("يرجى إدخال رسالة لتحويلها إلى كود.");
  if (!output) return alert("خطأ: حقل كود المحادثة غير موجود.");

  const message = input.value.trim();
  const encoded = btoa(unescape(encodeURIComponent(message)));
  output.value = encoded;
  input.value = "";
  alert("تم تحويل الرسالة إلى كود!");
}

function decodeMessage() {
  const input = document.getElementById("chat-code-input");
  const output = document.getElementById("chat-message-display");
  if (!input || !input.value.trim()) return alert("يرجى إدخال كود المحادثة.");
  if (!output) return alert("خطأ: حقل عرض الرسالة غير موجود.");

  try {
    const decoded = decodeURIComponent(escape(atob(input.value.trim())));
    output.value = decoded;
    alert("تم تفسير الكود إلى رسالة!");
  } catch {
    alert("الكود غير صالح أو تالف.");
  }
}

// إدارة المهمات
function generateNewQuest() {
  if (village.quests.length >= 3) {
    return alert("لديك الحد الأقصى من المهمات (3). أكمل مهمة أولاً!");
  }

  const available = availableQuests.filter(q => !village.quests.some(vq => vq.id === q.id));
  if (available.length === 0) {
    return alert("لا توجد مهام جديدة متاحة!");
  }

  const quest = available[Math.floor(Math.random() * available.length)];
  village.quests.push({ ...quest, completed: false });
  updateQuests();
  alert(`تم إنشاء مهمة جديدة: ${quest.description}`);
}

function updateQuests() {
  const questList = document.getElementById("quest-list");
  if (!questList) return;

  questList.innerHTML = "";
  village.quests.forEach((quest, index) => {
    const isCompleted = quest.condition();
    const questElement = document.createElement("div");
    questElement.className = "quest";
    questElement.innerHTML = `
      <p>${quest.description} - الحالة: ${isCompleted ? "مكتملة" : "غير مكتملة"}</p>
      ${isCompleted ? `<button onclick="claimQuestReward(${index})">استلام المكافأة</button>` : ""}
    `;
    questList.appendChild(questElement);
  });
}

function claimQuestReward(index) {
  const quest = village.quests[index];
  if (!quest || !quest.condition()) return alert("المهمة غير مكتملة!");

  for (const resource in quest.reward) {
    village.resources[resource] = (village.resources[resource] || 0) + quest.reward[resource];
  }
  alert(`تم استلام مكافأة المهمة: ${Object.entries(quest.reward).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  village.quests.splice(index, 1);
  updateResources();
}

// بدء التحديث الدوري للإنتاج
setInterval(produceResources, productionInterval);

// التحديث المبدئي
updateResources();
drawFarm();