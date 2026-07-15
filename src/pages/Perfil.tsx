import { Grid3X3, Bookmark, Heart, Settings, Link as LinkIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";
import concept4 from "@/assets/concept-4.jpg";
import concept5 from "@/assets/concept-5.jpg";
import concept6 from "@/assets/concept-6.jpg";
import concept7 from "@/assets/concept-7.jpg";
import concept8 from "@/assets/concept-8.jpg";

const tabs = [
  { id: "posts", icon: Grid3X3, label: "Posts" },
  { id: "saved", icon: Bookmark, label: "Salvos" },
  { id: "liked", icon: Heart, label: "Curtidos" },
];

const posts = [
  concept1, concept2, concept3, concept4,
  concept5, concept6, concept7, concept8,
];

const stats = [
  { label: "Publicações", value: "128" },
  { label: "Seguidores", value: "4.2k" },
  { label: "Seguindo", value: "312" },
];

const boards = [
  { title: "Inverno 2026", count: 24, images: [concept1, concept3, concept5] },
  { title: "Infantil", count: 18, images: [concept2, concept6, concept4] },
  { title: "Tendências", count: 32, images: [concept7, concept8, concept1] },
  { title: "Favoritos", count: 15, images: [concept4, concept2, concept7] },
];

const Perfil = () => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-hidden">
      {/* Profile Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-10 max-w-3xl mx-auto">
          <div className="flex h-20 w-20 md:h-36 md:w-36 items-center justify-center rounded-full bg-gradient-to-br from-accent to-tertiary p-[3px] shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card">
              <span className="text-2xl md:text-5xl font-bold text-foreground">N</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">nextil_user</h1>
              <div className="flex gap-2">
                <button className="px-5 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Editar Perfil
                </button>
                <Link
                  to="/precificacao"
                  className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors inline-flex items-center gap-1.5"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Minha precificação</span>
                </Link>
                <button className="p-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-start gap-6 mt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center md:text-left">
                  <span className="font-semibold text-foreground">{stat.value}</span>
                  <span className="ml-1 text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">Comprador de Moda</p>
              <p className="text-sm text-muted-foreground">Curadoria de tendências e coleções para multimarcas 🛍️</p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-sm text-accent">
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="font-medium">nextil.com.br</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-border">
        <div className="flex justify-center max-w-3xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-t-2 ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-2 md:px-6 py-3 md:py-6 max-w-5xl mx-auto w-full">
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {posts.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-square overflow-hidden rounded-sm md:rounded-lg cursor-pointer group"
              >
                <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Heart className="h-6 w-6 text-card" fill="currentColor" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {boards.map((board, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="cursor-pointer group"
              >
                <div className="grid grid-cols-2 grid-rows-2 gap-0.5 rounded-xl md:rounded-2xl overflow-hidden aspect-square">
                  <div className="row-span-2 col-span-1 overflow-hidden">
                    <img src={board.images[0]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="overflow-hidden">
                    <img src={board.images[1]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="overflow-hidden">
                    <img src={board.images[2]} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{board.title}</h3>
                <p className="text-xs text-muted-foreground">{board.count} pins</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="grid grid-cols-3 gap-1 md:gap-3">
            {[...posts].reverse().map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-square overflow-hidden rounded-sm md:rounded-lg cursor-pointer group"
              >
                <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
