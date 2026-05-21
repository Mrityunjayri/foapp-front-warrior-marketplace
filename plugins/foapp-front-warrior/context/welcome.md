## 🛡️ FOAPPFrontWarrior — Active

**Tumhara AI coding assistant ready hai!** Ye plugin dono repos samajhta hai — OperatorApp (Android) + OperatorAppFlutter (Flutter).

### Quick start — ye 5 commands yaad rakho:

| Command | Kya karta hai | Kab use karo |
|---------|--------------|--------------|
| `/sync` | Dono repos scan karke knowledge update karta hai | Sprint start pe ya major merge ke baad |
| `/build-feature` | PRD + Figma se production code banata hai | Naya feature develop karna ho |
| `/check-code` | Code conventions check karta hai (Dart + Kotlin) | PR bhejne se pehle |
| `/explain-flow` | Feature ka pura flow samjhata hai (Android → Bridge → Flutter) | Existing feature modify karne se pehle |
| `/find-widget` | Existing widgets dhundhta hai dono repos me | Naya widget banane se pehle |

### Pehli baar use kar rahe ho?
1. Apne **OperatorAppFlutter** aur **OperatorApp** folders connect karo (Add folder)
2. **Figma** aur **Atlassian** connectors connect karo (Settings → Connectors)
3. Type karo: `/sync` — ye 2-5 min me dono repos scan kar lega

### Example workflow:
```
Tum: Build the Ask Munshi feature
      PRD: [confluence link]
      Figma: [figma link]

Claude: [PRD padhega] → [Figma design dekhega] → [Impact analysis dikhayega]
        → [Tumhara approval lega] → [Code generate karega] → [Conventions check karega]
```

**Note:** Ye plugin code generate karte waqt CLAUDE.md ke saare rules follow karta hai — colors, text styles, spacing, buttons, navigation, BLoC, API patterns, DI — sab automatically compliant hoga.
