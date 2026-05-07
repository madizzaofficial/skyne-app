import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { MOCK_PRODUCTS, Product } from "@/constants/mockData";
import { useAuth } from "@/context/AuthContext";
import {
  loadUserData,
  saveUserFavorites,
  saveUserHistory,
  saveUserRoutine,
} from "@/services/firestoreUser";
import type { RoutineItem, ScanHistoryItem } from "@/types/appTypes";

export type { RoutineItem, ScanHistoryItem };

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  routine: RoutineItem[];
  addToRoutine: (productId: string, moment: "matin" | "soir") => void;
  removeFromRoutine: (productId: string, moment: "matin" | "soir") => void;
  toggleRoutineDone: (productId: string, moment: "matin" | "soir") => void;
  scanHistory: ScanHistoryItem[];
  addToHistory: (productId: string) => void;
  getProductById: (id: string) => Product | undefined;
  addScannedProduct: (product: Product) => void;
  getRoutineProducts: (moment: "matin" | "soir") => { item: RoutineItem; product: Product }[];
  getIncompatibilities: () => { product1: string; product2: string; reason: string }[];
  routineScore: number;
  allProducts: Product[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FAV_KEY = "@skinscan_favorites";
const ROUTINE_KEY = "@skinscan_routine";
const HISTORY_KEY = "@skinscan_history";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [routine, setRoutine] = useState<RoutineItem[]>([
    { productId: "2", moment: "matin", order: 0, done: false },
    { productId: "4", moment: "matin", order: 1, done: true },
    { productId: "1", moment: "soir", order: 0, done: false },
  ]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([
    { productId: "1", scannedAt: new Date(Date.now() - 3600000).toISOString() },
    { productId: "3", scannedAt: new Date(Date.now() - 86400000).toISOString() },
    { productId: "2", scannedAt: new Date(Date.now() - 172800000).toISOString() },
  ]);
  const [scannedProducts, setScannedProducts] = useState<Record<string, Product>>({});

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [favs, rout, hist] = await Promise.all([
          AsyncStorage.getItem(FAV_KEY),
          AsyncStorage.getItem(ROUTINE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (favs) setFavorites(JSON.parse(favs));
        if (rout) setRoutine(JSON.parse(rout));
        if (hist) setScanHistory(JSON.parse(hist));
      } catch {}
    })();
  }, []);

  // Sync from Firestore when user authenticates
  useEffect(() => {
    if (!user) return;
    loadUserData(user.uid).then((data) => {
      if (!data) return;
      if (data.favorites?.length) setFavorites(data.favorites);
      if (data.routine?.length) setRoutine(data.routine);
      if (data.scanHistory?.length) setScanHistory(data.scanHistory);
    });
  }, [user?.uid]);

  const saveRoutine = async (r: RoutineItem[]) => {
    setRoutine(r);
    await AsyncStorage.setItem(ROUTINE_KEY, JSON.stringify(r));
    if (user) saveUserRoutine(user.uid, r);
  };

  const toggleFavorite = async (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(next);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
    if (user) saveUserFavorites(user.uid, next);
  };

  const addToRoutine = (productId: string, moment: "matin" | "soir") => {
    if (routine.some((r) => r.productId === productId && r.moment === moment)) return;
    const order = routine.filter((r) => r.moment === moment).length;
    saveRoutine([...routine, { productId, moment, order, done: false }]);
  };

  const removeFromRoutine = (productId: string, moment: "matin" | "soir") => {
    saveRoutine(routine.filter((r) => !(r.productId === productId && r.moment === moment)));
  };

  const toggleRoutineDone = (productId: string, moment: "matin" | "soir") => {
    saveRoutine(
      routine.map((r) =>
        r.productId === productId && r.moment === moment ? { ...r, done: !r.done } : r
      )
    );
  };

  const addToHistory = async (productId: string) => {
    const next = [
      { productId, scannedAt: new Date().toISOString() },
      ...scanHistory.filter((h) => h.productId !== productId).slice(0, 49),
    ];
    setScanHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    if (user) saveUserHistory(user.uid, next);
  };

  const addScannedProduct = (product: Product) => {
    setScannedProducts((prev) => ({ ...prev, [product.id]: product }));
  };

  const getProductById = (id: string): Product | undefined =>
    scannedProducts[id] ?? MOCK_PRODUCTS.find((p) => p.id === id);

  const getRoutineProducts = (moment: "matin" | "soir") =>
    routine
      .filter((r) => r.moment === moment)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({ item, product: getProductById(item.productId)! }))
      .filter((r) => r.product);

  const getIncompatibilities = () => {
    const results: { product1: string; product2: string; reason: string }[] = [];
    const all = [...getRoutineProducts("matin"), ...getRoutineProducts("soir")];
    all.forEach(({ product }) => {
      product.incompatibilities.forEach((incompat) => {
        const conflictId = incompat.toLowerCase().includes("rétinol")
          ? "5"
          : incompat.toLowerCase().includes("aha")
          ? "3"
          : null;
        if (conflictId) {
          const conflict = all.find((p) => p.product.id === conflictId);
          if (conflict && product.id !== conflictId) {
            results.push({ product1: product.name, product2: conflict.product.name, reason: incompat });
          }
        }
      });
    });
    return results;
  };

  const routineScore = (() => {
    const all = [...getRoutineProducts("matin"), ...getRoutineProducts("soir")];
    if (all.length === 0) return 0;
    const safe = all.filter((r) =>
      r.product.ingredients.every((i) => i.safetyLevel !== "avoid")
    ).length;
    return Math.round((safe / all.length) * 100);
  })();

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        routine,
        addToRoutine,
        removeFromRoutine,
        toggleRoutineDone,
        scanHistory,
        addToHistory,
        getProductById,
        addScannedProduct,
        getRoutineProducts,
        getIncompatibilities,
        routineScore,
        allProducts: [...MOCK_PRODUCTS, ...Object.values(scannedProducts)],
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
