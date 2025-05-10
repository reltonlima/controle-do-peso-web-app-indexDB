let db; // sql.js database instance
        let weightChart;
        const SQL_WASM_PATH = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

        // IndexedDB Constants
        const IDB_NAME = "WeightTrackerDB";
        const IDB_VERSION = 1;
        const IDB_STORE_NAME = "sqliteStore";
        const IDB_KEY = "userWeightSQLiteDB";

        const statusDisplay = document.getElementById('statusDisplay');

        function showStatus(messageKey, isError = false) {
            const message = getTranslatedString(messageKey);
            statusDisplay.textContent = message;
            statusDisplay.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
            statusDisplay.style.display = 'block';
            setTimeout(() => { statusDisplay.style.display = 'none'; }, 5000);
        }

        let translations = {}; // Object to store translations
        let currentLanguage = 'pt-BR'; // Default language

        async function loadTranslations(lang) {
            try {
                const response = await fetch(`./lang/${lang}.json`);
                translations = await response.json();
                console.log(`Translations loaded for language: ${lang}`);
            } catch (err) {
                console.error(`Failed to load translations for language: ${lang}`, err);
            }
        }

        function getTranslatedString(key) {
            return translations[key] || key; // Return the key itself if no translation is found
        }

        // --- IndexedDB Helper Functions ---
        function openIDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(IDB_NAME, IDB_VERSION);
                request.onerror = (event) => reject("IndexedDB error: " + request.error);
                request.onsuccess = (event) => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const idb = request.result;
                    if (!idb.objectStoreNames.contains(IDB_STORE_NAME)) {
                        idb.createObjectStore(IDB_STORE_NAME);
                    }
                };
            });
        }

        async function saveDBToIndexedDB(sqlJsDbInstance) {
            if (!sqlJsDbInstance) {
                console.warn("No sql.js instance to save to IndexedDB.");
                return;
            }
            try {
                const dbFileArray = sqlJsDbInstance.export();
                const idb = await openIDB();
                const transaction = idb.transaction(IDB_STORE_NAME, "readwrite");
                const store = transaction.objectStore(IDB_STORE_NAME);
                store.put(dbFileArray, IDB_KEY);
                return new Promise((resolve, reject) => {
                    transaction.oncomplete = () => {
                        console.log("Database saved to IndexedDB.");
                        showStatus("Data saved automatically!");
                        resolve();
                    };
                    transaction.onerror = () => {
                        console.error("Error saving DB to IndexedDB:", transaction.error);
                        showStatus("Error saving data automatically.", true);
                        reject(transaction.error);
                    };
                });
            } catch (err) {
                console.error("Failed to save to IndexedDB:", err);
                showStatus("Critical error saving data.", true);
            }
        }

        async function loadDBFromIndexedDB() {
            try {
                const idb = await openIDB();
                const transaction = idb.transaction(IDB_STORE_NAME, "readonly");
                const store = transaction.objectStore(IDB_STORE_NAME);
                const request = store.get(IDB_KEY);
                return new Promise((resolve, reject) => {
                    request.onsuccess = () => {
                        resolve(request.result ? new Uint8Array(request.result) : null);
                    };
                    request.onerror = () => {
                        console.error("Error loading DB from IndexedDB:", request.error);
                        showStatus("Error loading saved data.", true);
                        reject(request.error);
                    };
                });
            } catch (err) {
                console.error("Failed to load from IndexedDB:", err);
                showStatus("Critical error loading data.", true);
                return null;
            }
        }

        // --- sql.js and Chart.js Functions ---
        async function initSQL() {
            try {
                const SQL = await initSqlJs({ locateFile: file => `${SQL_WASM_PATH}${file}` });
                return SQL;
            } catch (err) {
                console.error("Failed to initialize sql.js:", err);
                showStatus("Error initializing database system. App may not work.", true);
                throw err;
            }
        }

        async function initAppDB() {
            try {
                const SQL = await initSQL();
                const existingDbArray = await loadDBFromIndexedDB();

                if (existingDbArray) {
                    db = new SQL.Database(existingDbArray);
                    console.log("Database loaded from IndexedDB.");
                    showStatus(getTranslatedString("statusDataLoaded"));
                } else {
                    db = new SQL.Database();
                    db.run("CREATE TABLE IF NOT EXISTS weight_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_date TEXT UNIQUE, weight REAL);");
                    console.log("New database created and table initialized.");
                    await saveDBToIndexedDB(db); // Save the new empty DB
                }
                loadDataAndRenderChart();
            } catch (err) {
                console.error("Failed to initialize app database:", err);
                showStatus("Could not initialize the database. Please refresh or check console.", true);
            }
        }

        async function addWeightEntry() {
            const dateInput = document.getElementById('entryDate');
            const weightInput = document.getElementById('weight');
            const entryDate = dateInput.value;
            const weight = parseFloat(weightInput.value);

            if (!entryDate || isNaN(weight) || weight <= 0) {
                alert(getTranslatedString("alertInvalidInput"));
                return;
            }
            if (!db) {
                showStatus("statusDbNotReady", true);
                return;
            }

            try {
                // Use INSERT OR REPLACE to update if date exists, or insert if new
                db.run("INSERT OR REPLACE INTO weight_entries (entry_date, weight) VALUES (?, ?)", [entryDate, weight]);
                console.log(`Entry added/updated: ${entryDate} - ${weight}kg`);
                dateInput.value = '';
                weightInput.value = '';
                await saveDBToIndexedDB(db);
                loadDataAndRenderChart();
            } catch (err) {
                console.error("Error adding entry:", err);
                if (err.message.includes("UNIQUE constraint failed")) {
                    showStatus("An entry for this date already exists. Use a different date or it will be overwritten if you submit again with the same date but different weight (feature not fully implemented here for explicit update).", true);
                } else {
                    showStatus("Failed to Adicionar registro de peso. Check console.", true);
                }
            }
        }

        function formatDateToBrazilian(dateString) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }

        async function loadDataAndRenderChart() {
            if (!db) return;
            try {
                const results = db.exec("SELECT entry_date, weight FROM weight_entries ORDER BY entry_date ASC");
                if (results.length === 0 || results[0].values.length === 0) {
                    renderChart([], []);
                    return;
                }
                const data = results[0].values;
                const labels = data.map(row => formatDateToBrazilian(row[0])); // Format dates
                const weights = data.map(row => row[1]);
                renderChart(labels, weights);
            } catch (err) {
                console.error("Error loading data for chart:", err);
                showStatus("Failed to load data for chart.", true);
            }
        }

        function renderChart(labels, data) {
            const ctx = document.getElementById('weightChart').getContext('2d');
            if (weightChart) {
                weightChart.destroy();
            }
            weightChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Histórico de Peso (kg)',
                        data: data,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: false, title: { display: true, text: 'Peso Registrado (kg)'}},
                              x: { title: { display: true, text: 'Data do Registro'}}},
                    plugins: { tooltip: { callbacks: { label: context => `Weight: ${context.parsed.y} kg`}}}
                }
            });
        }

        async function exportDatabase() {
            if (!db) {
                showStatus("Database not ready.", true);
                return;
            }
            try {
                const data = db.export();
                const blob = new Blob([data], { type: "application/x-sqlite3" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "weight_tracker_db.sqlite";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showStatus("Database exported successfully!");
            } catch (err) {
                console.error("Error exporting database:", err);
                showStatus("Failed to export database.", true);
            }
        }

        async function importDatabase(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const SQL = await initSQL(); // Ensure SQL is initialized
                    const importedDbArray = new Uint8Array(reader.result);
                    db = new SQL.Database(importedDbArray); // Load imported data into sql.js
                    console.log("Database imported from file.");
                    await saveDBToIndexedDB(db); // Save the newly imported DB to IndexedDB
                    loadDataAndRenderChart();
                    showStatus("Database imported and saved successfully!");
                } catch (err) {
                    console.error("Error importing database:", err);
                    showStatus("Failed to import database. Ensure it's a valid SQLite file.", true);
                } finally {
                    event.target.value = null; // Clear file input
                }
            };
            reader.readAsArrayBuffer(file);
        }

        // Event Listeners
        document.getElementById('addEntryBtn').addEventListener('click', addWeightEntry);
        document.getElementById('exportDbBtn').addEventListener('click', exportDatabase);
        document.getElementById('importDbInput').addEventListener('change', importDatabase);

        document.addEventListener('DOMContentLoaded', async () => {
            const userLang = navigator.language || 'pt-BR'; // Detect browser language
            currentLanguage = userLang.startsWith('pt') ? 'pt-BR' : 'en'; // Default to 'pt-BR' or 'en'
            await loadTranslations(currentLanguage); // Load translations

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('entryDate').value = today;
            initAppDB(); // Initialize database system on page load
        });