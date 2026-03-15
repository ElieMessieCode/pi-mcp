# pi-mcp

> Extension Pi pour connecter des serveurs MCP (Model Context Protocol) via HTTP

[![npm version](https://badge.fury.io/js/pi-mcp.svg)](https://www.npmjs.com/package/pi-mcp)
[![Downloads](https://img.shields.io/npm/dm/pi-mcp.svg)](https://www.npmjs.com/package/pi-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Fonctionnalités

- 🌐 Connexion aux serveurs MCP via HTTP/SSE ou Streamable HTTP
- 🔧 Découverte automatique des outils disponibles sur les serveurs
- 🛠️ Enregistrement des outils MCP comme outils natifs Pi
- 📊 Gestion des connexions via commandes slash
- 💾 Configuration persistante entre les sessions

## Installation

Copiez le dossier `pi-mcp` dans :
- `~/.pi/agent/extensions/pi-mcp/` (global - tous les projets)
- `.pi/extensions/pi-mcp/` (local au projet)

Ou installez via :
```bash
pi -e ./pi-mcp
```

## Usage

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/mcp add <name> <url>` | Ajouter un serveur MCP |
| `/mcp remove <name>` | Supprimer un serveur |
| `/mcp list` | Lister les serveurs configurés |
| `/mcp connect <name>` | Se connecter à un serveur |
| `/mcp disconnect <name>` | Se déconnecter d'un serveur |
| `/mcp tools [name]` | Lister les outils disponibles |
| `/mcp status` | Afficher l'état des connexions |
| `/mcp refresh [name]` | Rafraîchir la liste des outils |
| `/mcp-status` | Vue d'ensemble rapide |

### Exemples

Ajouter un serveur MCP :
```
/mcp add my-server https://my-mcp-server.com/mcp
```

Ajouter un serveur avec authentification :
```
/mcp add github https://api.github.com/mcp Authorization=Bearer ghp_xxx
```

Connecter tous les serveurs configurés (au démarrage de session):
```
/mcp connect my-server
```

Utiliser un outil MCP (automatiquement enregistré) :
```
L'outil apparaîtra automatiquement dans la liste des outils disponibles
avec le préfixe mcp_<server-name>_<tool-name>
```

## Protocole supporté

- **Streamable HTTP** (recommandé) : JSON-RPC avec support SSE
- **SSE** : Server-Sent Events pour les notifications
- **HTTP simple** : Requêtes-réponses JSON-RPC

## Types de données supportés

Les outils MCP sont automatiquement convertis en outils Pi avec :
- Schéma de paramètres JSON → TypeBox
- Support des types : `string`, `number`, `integer`, `boolean`, `array`, `object`
- Description et documentation automatiques

## Architecture

```
pi-mcp/
├── index.ts          # Extension principale
├── README.md         # Cette documentation
└── package.json      # Métadonnées du package
```

## Exemple de serveur MCP compatible

```typescript
// Serveur MCP simple avec un outil
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({
  name: "example-server",
  version: "1.0.0",
});

server.tool("get_weather", 
  { city: { type: "string", description: "City name" } },
  async ({ city }) => ({
    content: [{ type: "text", text: `Weather in ${city}: Sunny, 22°C` }]
  })
);

// Démarrer le serveur HTTP
server.start(3000);
```

## Dépannage

**Connexion échouée :**
- Vérifiez que l'URL est accessible
- Vérifiez les headers d'authentification
- Utilisez `/mcp status` pour voir les erreurs

**Outils non détectés :**
- Utilisez `/mcp refresh <name>` pour rafraîchir
- Vérifiez que le serveur implémente `tools/list`

**Timeout des requêtes :**
- Timeout par défaut : 30 secondes
- Vérifiez la latence du réseau

---

## 📋 TODO - Roadmap

### 🔴 Haute Priorité
- [ ] **Auto-reconnect** - Reconnexion automatique si serveur tombe
- [ ] **Health check** - Vérification périodique de la connexion des serveurs
- [ ] **Tool cleanup** - Désinscription des outils si serveur déconnecté

### 🟡 Moyenne Priorité
- [ ] **Resources MCP** - Afficher et utiliser les ressources MCP (`/mcp resources`)
- [ ] **Prompts MCP** - Afficher et utiliser les prompts MCP (`/mcp prompts`)
- [ ] **TLS/SSL skip** - Option pour ignorer les certificats auto-signés (`--insecure`)
- [ ] **Server timeout config** - Timeout configurable par serveur
- [ ] **Move server** - Commande `/mcp move <name> --global|--project` pour changer de scope
- [ ] **Export/Import** - Exporter/importer la configuration serveurs

### 🟢 Basse Priorité
- [ ] **Server groups** - Grouper des serveurs (`/mcp group add <name> <server1> <server2>`)
- [ ] **Tool filters** - Filtrer les outils par pattern (`/mcp add x --filter="assets-*"`)
- [ ] **Connection history** - Historique des connexions et erreurs
- [ ] **Metrics** - Statistiques d'utilisation des outils MCP
- [ ] **Custom tool templates** - Templates pour créer des outils MCP personnalisés

### 🐛 Bugs connus
- [ ] Gérer les caractères spéciaux dans les URLs
- [ ] Timeout plus explicite en cas d'erreur de connexion
- [ ] Supporter les serveurs MCP avec authentification Basic

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 

1. Fork le repo
2. Crée une branche (`git checkout -b feature/amazing-feature`)
3. Commit tes changements (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvre un Pull Request

## 📄 License

MIT - voir [LICENSE](LICENSE) pour les détails

---

**Repository:** [github.com/ElieMessieCode/pi-mcp](https://github.com/ElieMessieCode/pi-mcp)
