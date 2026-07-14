(function () {
  "use strict";
  var root = window.HSKFlashcards;
  var payload = {
  "schemaVersion": "2",
  "syllabusId": "hsk-2025-11",
  "level": 1,
  "officialPointIds": [
    "hsk26-g1-001",
    "hsk26-g1-002",
    "hsk26-g1-003",
    "hsk26-g1-004",
    "hsk26-g1-005",
    "hsk26-g1-006",
    "hsk26-g1-007",
    "hsk26-g1-008",
    "hsk26-g1-009",
    "hsk26-g1-010",
    "hsk26-g1-011",
    "hsk26-g1-012",
    "hsk26-g1-013",
    "hsk26-g1-014",
    "hsk26-g1-015",
    "hsk26-g1-016",
    "hsk26-g1-017",
    "hsk26-g1-018",
    "hsk26-g1-019",
    "hsk26-g1-020",
    "hsk26-g1-021",
    "hsk26-g1-022",
    "hsk26-g1-023",
    "hsk26-g1-024",
    "hsk26-g1-025",
    "hsk26-g1-026",
    "hsk26-g1-027",
    "hsk26-g1-028",
    "hsk26-g1-029",
    "hsk26-g1-030",
    "hsk26-g1-031",
    "hsk26-g1-032",
    "hsk26-g1-033",
    "hsk26-g1-034",
    "hsk26-g1-035",
    "hsk26-g1-036",
    "hsk26-g1-037",
    "hsk26-g1-038",
    "hsk26-g1-039",
    "hsk26-g1-040",
    "hsk26-g1-041",
    "hsk26-g1-042",
    "hsk26-g1-043",
    "hsk26-g1-044",
    "hsk26-g1-045",
    "hsk26-g1-046",
    "hsk26-g1-047",
    "hsk26-g1-048",
    "hsk26-g1-049",
    "hsk26-g1-050",
    "hsk26-g1-051",
    "hsk26-g1-052",
    "hsk26-g1-053",
    "hsk26-g1-054",
    "hsk26-g1-055",
    "hsk26-g1-056",
    "hsk26-g1-057",
    "hsk26-g1-058",
    "hsk26-g1-059",
    "hsk26-g1-060",
    "hsk26-g1-061",
    "hsk26-g1-062",
    "hsk26-g1-063",
    "hsk26-g1-064",
    "hsk26-g1-065",
    "hsk26-g1-066",
    "hsk26-g1-067",
    "hsk26-g1-068",
    "hsk26-g1-069",
    "hsk26-g1-070"
  ],
  "categories": [
    {
      "key": "category-1",
      "labelEn": "Morphemes",
      "labelZh": "语素"
    },
    {
      "key": "category-2",
      "labelEn": "Word classes",
      "labelZh": "词类"
    },
    {
      "key": "category-3",
      "labelEn": "Phrases",
      "labelZh": "短语"
    },
    {
      "key": "category-4",
      "labelEn": "Sentence components",
      "labelZh": "句子成分"
    },
    {
      "key": "category-5",
      "labelEn": "Sentence types",
      "labelZh": "句子的类型"
    },
    {
      "key": "category-6",
      "labelEn": "Aspects of actions",
      "labelZh": "动作的态"
    },
    {
      "key": "category-7",
      "labelEn": "Special expressions",
      "labelZh": "特殊表达法"
    }
  ],
  "lessons": [
    {
      "id": "glesson_1412363f764e4b6e804c4a579f649313",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-001"
      ],
      "titleEn": "Building words with 小 and 第",
      "targetFormZh": "小—、第—",
      "categoryKey": "category-1",
      "categoryEn": "Morphemes",
      "categoryZh": "语素",
      "purposeEn": "Express a smaller or junior type with 小, and identify ordinal position with 第.",
      "patterns": [
        {
          "labelEn": "Small or junior label",
          "appliesToZh": [
            "小—"
          ],
          "pattern": "小 + Noun",
          "formationEn": "Attach 小 directly before a suitable noun.",
          "usageEn": "Names a smaller, younger, or junior member of a type."
        },
        {
          "labelEn": "Ordinal number",
          "appliesToZh": [
            "第—"
          ],
          "pattern": "第 + Numeral",
          "formationEn": "Place 第 immediately before the number.",
          "usageEn": "States position in an ordered series."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "小—",
            "第—"
          ],
          "textEn": "Both morphemes attach directly to what follows; do not insert 的."
        }
      ],
      "watchOutEn": "第 marks order, not quantity: 第一本书 is 'the first book,' not 'one book.'",
      "examples": [
        {
          "id": "gexample_50e064c31dee44b188b641f07ed75c8c",
          "zh": "她是小学生。",
          "pinyin": "Tā shì xiǎoxuéshēng.",
          "translationEn": "She is a primary school student.",
          "analyses": [
            {
              "textEn": "小 attaches to 学生 inside 小学生 and identifies the junior school category."
            }
          ],
          "parts": [
            {
              "text": "她是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "小",
              "emphasized": true,
              "role": "prefix"
            },
            {
              "text": "学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_3cd63eee4a664a4f810f20ad6028dadb",
          "zh": "这是第一本书。",
          "pinyin": "Zhè shì dì-yī běn shū.",
          "translationEn": "This is the first book.",
          "analyses": [
            {
              "textEn": "第 comes directly before 一, turning the number into the ordinal 'first.'"
            }
          ],
          "parts": [
            {
              "text": "这是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "第",
              "emphasized": true,
              "role": "prefix"
            },
            {
              "text": "一本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_47131ae8ea394437a5297f42b342b73d",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-002"
      ],
      "titleEn": "Plural people and location sides",
      "targetFormZh": "—们、—边",
      "categoryKey": "category-1",
      "categoryEn": "Morphemes",
      "categoryZh": "语素",
      "purposeEn": "Express a group of people with 们 and form common side or location words with 边.",
      "patterns": [
        {
          "labelEn": "Human plural",
          "appliesToZh": [
            "—们"
          ],
          "pattern": "Human pronoun/noun + 们",
          "formationEn": "Attach 们 directly to the human expression.",
          "usageEn": "Refers to more than one person."
        },
        {
          "labelEn": "Side or place",
          "appliesToZh": [
            "—边"
          ],
          "pattern": "Direction/Demonstrative + 边",
          "formationEn": "Attach 边 to a direction or demonstrative.",
          "usageEn": "Forms words such as 那边 and 外边."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "—们",
            "—边"
          ],
          "textEn": "These suffixes form one lexical unit with the expression before them."
        }
      ],
      "watchOutEn": "们 normally follows human pronouns or human nouns; do not add it after a number and classifier.",
      "examples": [
        {
          "id": "gexample_2a7e0ab90b1d4119ba79a7e6ab0227d2",
          "zh": "我们是学生。",
          "pinyin": "Wǒmen shì xuéshēng.",
          "translationEn": "We are students.",
          "analyses": [
            {
              "textEn": "们 follows 我 to form 我们, the plural first-person pronoun 'we.'"
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "们",
              "emphasized": true,
              "role": "suffix"
            },
            {
              "text": "是学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7c8199c4171d45d3b63ee87e362a1b56",
          "zh": "书在那边。",
          "pinyin": "Shū zài nàbiān.",
          "translationEn": "The book is over there.",
          "analyses": [
            {
              "textEn": "边 attaches to 那 and forms 那边, a location away from the speaker."
            }
          ],
          "parts": [
            {
              "text": "书在那",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "边",
              "emphasized": true,
              "role": "suffix"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_738334fb58814bb3ac80ac4ee0ab7edf",
          "zh": "你们在那边吗？",
          "pinyin": "Nǐmen zài nàbiān ma?",
          "translationEn": "Are you over there?",
          "analyses": [
            {
              "textEn": "们 attaches to 你 to form the plural addressee 你们."
            },
            {
              "textEn": "边 attaches to 那 to form 那边, the place being asked about."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "们",
              "emphasized": true,
              "role": "suffix"
            },
            {
              "text": "在那",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "边",
              "emphasized": true,
              "role": "suffix"
            },
            {
              "text": "吗？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_a9c2ecd6c785436fa03139619ca2affd",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-003"
      ],
      "titleEn": "Basic location nouns",
      "targetFormZh": "上、下、里、外、前、后",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express relative location with 上/下 (on/under), 里/外 (inside/outside), and 前/后 (in front/behind).",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "上",
            "下",
            "里",
            "外",
            "前",
            "后"
          ],
          "textEn": "Put the reference place or object before the location noun."
        },
        {
          "kind": "usage",
          "appliesToZh": [
            "上",
            "下",
            "里",
            "外",
            "前",
            "后"
          ],
          "textEn": "The resulting location phrase can follow 在 or come before 有."
        }
      ],
      "watchOutEn": "A reference noun normally comes before the location noun: 桌子上, not 上桌子.",
      "examples": [
        {
          "id": "gexample_d03ad36d70634a909fc2d6b4733036c8",
          "zh": "书在桌子上。",
          "pinyin": "Shū zài zhuōzi shàng.",
          "translationEn": "The book is on the table.",
          "analyses": [
            {
              "textEn": "上 follows 桌子 and locates the book on the table's upper surface."
            }
          ],
          "parts": [
            {
              "text": "书在桌子",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "上",
              "emphasized": true,
              "role": "location_noun"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_fd391a1aff1d4ae7a09713892ca5dc05",
          "zh": "猫在房间里。",
          "pinyin": "Māo zài fángjiān lǐ.",
          "translationEn": "The cat is in the room.",
          "analyses": [
            {
              "textEn": "里 follows 房间 and marks the room's interior as the location."
            }
          ],
          "parts": [
            {
              "text": "猫在房间",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "里",
              "emphasized": true,
              "role": "location_noun"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_6fbcb4305c5d4a5d88bf76bae817835f",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-004"
      ],
      "titleEn": "Learned ability with 会 and possible ability with 能",
      "targetFormZh": "会、能",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a learned skill with 会 or say that ability and circumstances make an action possible with 能.",
      "patterns": [
        {
          "labelEn": "Modal before an action",
          "appliesToZh": [
            "会",
            "能"
          ],
          "pattern": "Subject + 会/能 + Verb",
          "formationEn": "Place the modal directly before the main verb.",
          "usageEn": "Select 会 for learned skill and 能 for ability or circumstances."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "会",
            "能"
          ],
          "textEn": "The modal comes before the action verb."
        },
        {
          "kind": "constraint",
          "appliesToZh": [
            "会",
            "能"
          ],
          "textEn": "For inability, put 不 before the modal: 不会说, 不能来. 能不来 means 'be allowed not to come,' a different scope."
        }
      ],
      "watchOutEn": "For a learned skill, 会 is usually more specific than 能; 能 often depends on ability or present circumstances.",
      "examples": [
        {
          "id": "gexample_e03f22d7927a49c196b1924303a49a27",
          "zh": "我会开车。",
          "pinyin": "Wǒ huì kāichē.",
          "translationEn": "I know how to drive.",
          "analyses": [
            {
              "textEn": "会 precedes 开车 and presents driving as a learned skill."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "会",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "开车。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_9b3d76cbd14a469191ff34e4df24d99f",
          "zh": "他今天能来。",
          "pinyin": "Tā jīntiān néng lái.",
          "translationEn": "He can come today.",
          "analyses": [
            {
              "textEn": "能 precedes 来 and says present ability or circumstances allow him to come."
            }
          ],
          "parts": [
            {
              "text": "他今天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "能",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "来。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_07ec7f37fb9d4665a4cfe702904e9cb5",
          "zh": "我会开车，今天不能开。",
          "pinyin": "Wǒ huì kāichē, jīntiān bù néng kāi.",
          "translationEn": "I know how to drive, but I cannot drive today.",
          "analyses": [
            {
              "textEn": "会开车 states the speaker's learned driving skill."
            },
            {
              "textEn": "不能开 places 不 before 能 to say that current circumstances prevent driving today."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "会",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "开车，今天不",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "能",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "开。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_5e7f55241f214616ac7cde0dbdddfd71",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-005"
      ],
      "titleEn": "Wants and intentions with 想 and 要",
      "targetFormZh": "想、要",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a wish with 想 or a firmer intention, need, or request with 要.",
      "patterns": [
        {
          "labelEn": "Desire before an action",
          "appliesToZh": [
            "想",
            "要"
          ],
          "pattern": "Subject + 想/要 + Verb",
          "formationEn": "Place 想 or 要 before the intended action.",
          "usageEn": "Use 想 for a wish and 要 for a stronger intention or need."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "想",
            "要"
          ],
          "textEn": "Both can introduce an action; 要 can also take a noun as the wanted item."
        }
      ],
      "watchOutEn": "想 is usually less definite than 要. 不想 + Verb means 'not want to'; 不要 + Verb can instead refuse or prohibit the action, depending on context.",
      "examples": [
        {
          "id": "gexample_812c8838412748ce893105502cde35c1",
          "zh": "我想喝茶。",
          "pinyin": "Wǒ xiǎng hē chá.",
          "translationEn": "I would like to drink tea.",
          "analyses": [
            {
              "textEn": "想 comes before 喝 and presents drinking tea as a wish."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "想",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "喝茶。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_d9b6396eb63e4015af1e703c5fc5cf64",
          "zh": "我要买这本书。",
          "pinyin": "Wǒ yào mǎi zhè běn shū.",
          "translationEn": "I want to buy this book.",
          "analyses": [
            {
              "textEn": "要 directly precedes 买 and gives the intended purchase a firmer force."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "要",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "买这本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_d801120377144d75aac90e0d18f5191d",
          "zh": "我不想吃饭，我要喝水。",
          "pinyin": "Wǒ bù xiǎng chīfàn, wǒ yào hē shuǐ.",
          "translationEn": "I do not want to eat; I want to drink water.",
          "analyses": [
            {
              "textEn": "不想吃饭 presents eating as something the speaker does not wish to do."
            },
            {
              "textEn": "要 directly precedes 喝水 and presents drinking water as the speaker's firmer intention."
            }
          ],
          "parts": [
            {
              "text": "我不",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "想",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "吃饭，我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "要",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "喝水。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_5a426c2d10734028a3898347249529d4",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-006"
      ],
      "titleEn": "Permission and acceptable options with 可以",
      "targetFormZh": "可以",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express that an action is permitted or is an available, acceptable option.",
      "patterns": [
        {
          "labelEn": "Permitted action",
          "appliesToZh": [
            "可以"
          ],
          "pattern": "Subject + 可以 + Verb",
          "formationEn": "Put 可以 immediately before the action.",
          "usageEn": "Grants, requests, or describes permission and acceptable possibility."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "可以"
          ],
          "textEn": "Add 吗 to the sentence to ask politely whether an action is allowed."
        }
      ],
      "watchOutEn": "可以 marks permission or an acceptable option, unlike learned-skill 会. 不可以 + Verb denies permission; 可以不 + Verb means that not doing it is allowed.",
      "examples": [
        {
          "id": "gexample_0c9e79eaffd64130906cc1c530d7e78f",
          "zh": "我可以坐这里吗？",
          "pinyin": "Wǒ kěyǐ zuò zhèlǐ ma?",
          "translationEn": "May I sit here?",
          "analyses": [
            {
              "textEn": "可以 precedes 坐 and, with 吗, asks for permission to sit here."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "可以",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "坐这里吗？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_a7768ead4d4d49cd97a3c2140ef1c96f",
          "zh": "你可以看这本书。",
          "pinyin": "Nǐ kěyǐ kàn zhè běn shū.",
          "translationEn": "You may read this book.",
          "analyses": [
            {
              "textEn": "可以 before 看 presents reading this book as permitted or acceptable."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "可以",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "看这本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_920977cd7f534274a8fee6c14bd3ac79",
          "zh": "这里不可以坐。",
          "pinyin": "Zhèlǐ bù kěyǐ zuò.",
          "translationEn": "Sitting is not allowed here.",
          "analyses": [
            {
              "textEn": "不 directly before 可以 denies permission to sit here; it does not negate a learned skill."
            }
          ],
          "parts": [
            {
              "text": "这里不",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "可以",
              "emphasized": true,
              "role": "modal"
            },
            {
              "text": "坐。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_bb78882713cf4b49876d78dacf6ebf54",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-007"
      ],
      "titleEn": "Common verb-object separable words",
      "targetFormZh": "看病、睡觉、说话、上课、下课、上班、下班、生病",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express everyday activities and states whose familiar two-character forms contain a verb-like part and an object-like part.",
      "patterns": [],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "看病",
            "睡觉",
            "说话",
            "上课",
            "下课",
            "上班",
            "下班",
            "生病"
          ],
          "textEn": "At this level, learn each item as a common activity or state while recognizing its internal verb-object structure."
        }
      ],
      "watchOutEn": "These forms behave as verb-object units, so later grammar may place material between their parts; do not assume every item is an indivisible verb.",
      "examples": [
        {
          "id": "gexample_fb219fe8846b4bbb9094c3248228ac94",
          "zh": "我去医院看病。",
          "pinyin": "Wǒ qù yīyuàn kànbìng.",
          "translationEn": "I am going to the hospital to see a doctor.",
          "analyses": [
            {
              "textEn": "看病 names the medical-care activity and follows 去医院 as its purpose."
            }
          ],
          "parts": [
            {
              "text": "我去医院",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "看病",
              "emphasized": true,
              "role": "separable_word"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_e949fd826ee74b4faa67eb69e0d73725",
          "zh": "学生在学校上课。",
          "pinyin": "Xuéshēng zài xuéxiào shàngkè.",
          "translationEn": "The students are in class at school.",
          "analyses": [
            {
              "textEn": "上课 functions as the activity performed by 学生 at 学校."
            }
          ],
          "parts": [
            {
              "text": "学生在学校",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "上课",
              "emphasized": true,
              "role": "separable_word"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_bd09eb58966b42ae876cce8a847b5639",
          "zh": "我爸爸八点上班，五点下班。",
          "pinyin": "Wǒ bàba bā diǎn shàngbān, wǔ diǎn xiàbān.",
          "translationEn": "My father starts work at eight and finishes work at five.",
          "analyses": [
            {
              "textEn": "上班 names the start of the father's work period at eight o'clock."
            },
            {
              "textEn": "下班 names the end of that work period at five o'clock."
            }
          ],
          "parts": [
            {
              "text": "我爸爸八点",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "上班",
              "emphasized": true,
              "role": "separable_word"
            },
            {
              "text": "，五点",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "下班",
              "emphasized": true,
              "role": "separable_word"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_43642677d6364b81a48e4506d8a0105c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-008"
      ],
      "titleEn": "Asking for missing information",
      "targetFormZh": "多、多少、几、哪、哪儿、哪里、哪些、什么、谁、怎么、怎么样",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a focused question about degree, quantity, identity, place, choice, manner, or condition.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "多",
            "多少",
            "几",
            "哪",
            "哪儿",
            "哪里",
            "哪些",
            "什么",
            "谁",
            "怎么",
            "怎么样"
          ],
          "textEn": "Replace the unknown sentence part with the matching interrogative pronoun."
        },
        {
          "kind": "constraint",
          "appliesToZh": [
            "多",
            "多少",
            "几",
            "哪",
            "哪儿",
            "哪里",
            "哪些",
            "什么",
            "谁",
            "怎么",
            "怎么样"
          ],
          "textEn": "Do not add 吗 to a question that already uses one of these question words."
        }
      ],
      "watchOutEn": "Keep the question word where the requested information belongs; Mandarin does not move it to the beginning just because it is a question.",
      "examples": [
        {
          "id": "gexample_34dd352d28474802a8e50ef8715e8199",
          "zh": "你想吃什么？",
          "pinyin": "Nǐ xiǎng chī shénme?",
          "translationEn": "What would you like to eat?",
          "analyses": [
            {
              "textEn": "什么 remains after 吃, exactly where the unknown food would appear in an answer."
            }
          ],
          "parts": [
            {
              "text": "你想吃",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "什么",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_30386be4fb844e0f94ed90724ec8ca07",
          "zh": "你住哪儿？",
          "pinyin": "Nǐ zhù nǎr?",
          "translationEn": "Where do you live?",
          "analyses": [
            {
              "textEn": "哪儿 occupies the location position after 住 and asks for that missing place."
            }
          ],
          "parts": [
            {
              "text": "你住",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "哪儿",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_6ddd11c4daa64d34adb6d16e3eeef847",
          "zh": "你多大？你家有多少人？",
          "pinyin": "Nǐ duō dà? Nǐ jiā yǒu duōshao rén?",
          "translationEn": "How old are you? How many people are in your family?",
          "analyses": [
            {
              "textEn": "多 appears before 大 to ask for the unknown degree of age."
            },
            {
              "textEn": "多少 occupies the quantity position before 人 and asks for the family size."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "多",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "大？你家有",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "多少",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "人？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_1a3df179f68d4d33aa38254927c24dbc",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-009"
      ],
      "titleEn": "Personal pronouns",
      "targetFormZh": "我、你、您、他、她、我们、你们、他们、她们、它、它们、大家",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express who is speaking, being addressed, or being discussed, in singular or plural reference.",
      "patterns": [],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "我",
            "你",
            "您",
            "他",
            "她",
            "我们",
            "你们",
            "他们",
            "她们",
            "它",
            "它们",
            "大家"
          ],
          "textEn": "A personal pronoun can serve as subject, object, or possessor according to its position."
        }
      ],
      "watchOutEn": "他, 她, and 它 sound alike but distinguish a male person, a female person, and a nonhuman referent in writing.",
      "examples": [
        {
          "id": "gexample_bb2a1560c4904d3a804750022dadcea7",
          "zh": "我们都是学生。",
          "pinyin": "Wǒmen dōu shì xuéshēng.",
          "translationEn": "We are all students.",
          "analyses": [
            {
              "textEn": "我们 is the plural first-person subject and includes the speaker."
            }
          ],
          "parts": [
            {
              "text": "我们",
              "emphasized": true,
              "role": "pronoun"
            },
            {
              "text": "都是学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_512f303622fb4803aed72d48dad01131",
          "zh": "她们在看电影。",
          "pinyin": "Tāmen zài kàn diànyǐng.",
          "translationEn": "They are watching a movie.",
          "analyses": [
            {
              "textEn": "她们 is the subject and refers to a group presented as all female."
            }
          ],
          "parts": [
            {
              "text": "她们",
              "emphasized": true,
              "role": "pronoun"
            },
            {
              "text": "在看电影。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_6360c8ccc591431488f7006797127eb7",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-010"
      ],
      "titleEn": "Pointing to people, things, and places",
      "targetFormZh": "这、那、这儿、那儿、这里、那里、这些、那些、有的、这个、那个、有些",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express which nearby or more distant person, thing, place, or subset you mean.",
      "patterns": [],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "这",
            "那",
            "这儿",
            "那儿",
            "这里",
            "那里",
            "这些",
            "那些",
            "有的",
            "这个",
            "那个",
            "有些"
          ],
          "textEn": "这-series forms point near the speaker; 那-series forms point farther away or back to known information."
        },
        {
          "kind": "usage",
          "appliesToZh": [
            "这",
            "那",
            "这儿",
            "那儿",
            "这里",
            "那里",
            "这些",
            "那些",
            "有的",
            "这个",
            "那个",
            "有些"
          ],
          "textEn": "有的 and 有些 select only part of a larger set."
        }
      ],
      "watchOutEn": "Before a noun, use a classifier where required: 这个人, not 这人 in the neutral beginner pattern.",
      "examples": [
        {
          "id": "gexample_74d23b54f4fc4352800dbd6a289755db",
          "zh": "这个很好吃。",
          "pinyin": "Zhège hěn hǎochī.",
          "translationEn": "This one is delicious.",
          "analyses": [
            {
              "textEn": "这个 stands alone as the subject and points to one nearby item."
            }
          ],
          "parts": [
            {
              "text": "这个",
              "emphasized": true,
              "role": "demonstrative"
            },
            {
              "text": "很好吃。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_232d71b233f64c12a3c979bae3264400",
          "zh": "那些是我的书。",
          "pinyin": "Nàxiē shì wǒ de shū.",
          "translationEn": "Those are my books.",
          "analyses": [
            {
              "textEn": "那些 is a plural distal demonstrative and identifies the books away from the speaker."
            }
          ],
          "parts": [
            {
              "text": "那些",
              "emphasized": true,
              "role": "demonstrative"
            },
            {
              "text": "是我的书。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_d7cad090d9554245a5dbed09caa87826",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-011"
      ],
      "titleEn": "Cardinal numbers and 两",
      "targetFormZh": "一、二/两、三、四、五、六、七、八、九、零、十、百、半、千",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express exact whole numbers, zero, and one half, and choose 二 or 两 in the appropriate counting context.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "一",
            "二",
            "两",
            "三",
            "四",
            "五",
            "六",
            "七",
            "八",
            "九",
            "零",
            "十",
            "百",
            "半",
            "千"
          ],
          "textEn": "Build larger numbers from the highest place value to the lowest."
        }
      ],
      "watchOutEn": "Use 两 rather than 二 before most classifiers: 两本书. Use 二 in counting and tens such as 二十; 两 is also common before 百 and 千.",
      "examples": [
        {
          "id": "gexample_f219decb9c3248189fc15a32b4f6e605",
          "zh": "我有二十本书。",
          "pinyin": "Wǒ yǒu èrshí běn shū.",
          "translationEn": "I have twenty books.",
          "analyses": [
            {
              "textEn": "二 begins 二十, where it is part of the fixed cardinal number twenty."
            }
          ],
          "parts": [
            {
              "text": "我有",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "二",
              "emphasized": true,
              "role": "numeral"
            },
            {
              "text": "十本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_8f16d444cfaa459bbb7bcee78c9ea47f",
          "zh": "我买了两件衣服。",
          "pinyin": "Wǒ mǎile liǎng jiàn yīfu.",
          "translationEn": "I bought two items of clothing.",
          "analyses": [
            {
              "textEn": "两 appears before the classifier 件 to express a quantity of two."
            }
          ],
          "parts": [
            {
              "text": "我买了",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "两",
              "emphasized": true,
              "role": "numeral"
            },
            {
              "text": "件衣服。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_92993e435fd2485884e66731507a89a7",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-012"
      ],
      "titleEn": "Dedicated nominal classifiers",
      "targetFormZh": "本、个、家、口、块、件、只、元",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express counted books, general items, establishments, family members, pieces, clothes, animals, and yuan with the expected classifier.",
      "patterns": [
        {
          "labelEn": "Counted noun phrase",
          "appliesToZh": [
            "本",
            "个",
            "家",
            "口",
            "块",
            "件",
            "只",
            "元"
          ],
          "pattern": "Numeral + Classifier + Noun",
          "formationEn": "Put the classifier between the number and noun.",
          "usageEn": "Choose the classifier licensed by the noun or counting domain."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "本",
            "个",
            "家",
            "口",
            "块",
            "件",
            "只",
            "元"
          ],
          "textEn": "Classifier choice is lexical: learn the common noun-classifier pairing."
        }
      ],
      "watchOutEn": "A numeral normally cannot attach directly to a noun; place the appropriate classifier between them.",
      "examples": [
        {
          "id": "gexample_d79059feec804af98e66458478217025",
          "zh": "我有一本书。",
          "pinyin": "Wǒ yǒu yì běn shū.",
          "translationEn": "I have one book.",
          "analyses": [
            {
              "textEn": "本 stands between 一 and 书 because books use this dedicated classifier."
            }
          ],
          "parts": [
            {
              "text": "我有一",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "本",
              "emphasized": true,
              "role": "classifier"
            },
            {
              "text": "书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7b4ec541d9c748e6b701fc95b9af1675",
          "zh": "那是一只猫。",
          "pinyin": "Nà shì yì zhī māo.",
          "translationEn": "That is a cat.",
          "analyses": [
            {
              "textEn": "只 classifies the animal 猫 inside the phrase 一只猫."
            }
          ],
          "parts": [
            {
              "text": "那是一",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "只",
              "emphasized": true,
              "role": "classifier"
            },
            {
              "text": "猫。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_ffcb8ee873944afc831b07219d8b60c4",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-013"
      ],
      "titleEn": "Cups as a borrowed classifier",
      "targetFormZh": "杯",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express portions served in cups or glasses by using 杯 between a number and a drink.",
      "patterns": [
        {
          "labelEn": "Cupful",
          "appliesToZh": [
            "杯"
          ],
          "pattern": "Numeral + 杯 + Drink",
          "formationEn": "Place 杯 between the number and drink.",
          "usageEn": "Counts a cupful or glassful rather than the substance in general."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "杯"
          ],
          "textEn": "The container noun 杯 is borrowed to classify the amount it holds."
        }
      ],
      "watchOutEn": "杯 can name a cup and can also classify its contents; in 一杯茶 it counts the serving.",
      "examples": [
        {
          "id": "gexample_72230dad3b214b48babca1deecda6de4",
          "zh": "我喝一杯茶。",
          "pinyin": "Wǒ hē yì bēi chá.",
          "translationEn": "I drink a cup of tea.",
          "analyses": [
            {
              "textEn": "杯 sits between 一 and 茶 and counts one cupful of tea."
            }
          ],
          "parts": [
            {
              "text": "我喝一",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "杯",
              "emphasized": true,
              "role": "classifier"
            },
            {
              "text": "茶。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_a54d45a24dd841bb9d25c9be7b1a7a8b",
          "zh": "她要两杯水。",
          "pinyin": "Tā yào liǎng bēi shuǐ.",
          "translationEn": "She wants two glasses of water.",
          "analyses": [
            {
              "textEn": "杯 classifies two servings of water after 两."
            }
          ],
          "parts": [
            {
              "text": "她要两",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "杯",
              "emphasized": true,
              "role": "classifier"
            },
            {
              "text": "水。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_0ea8d4c037714582adefa79b36b4a035",
          "zh": "你要几杯茶？",
          "pinyin": "Nǐ yào jǐ bēi chá?",
          "translationEn": "How many cups of tea do you want?",
          "analyses": [
            {
              "textEn": "杯 follows the interrogative number 几 and classifies the requested servings of tea."
            }
          ],
          "parts": [
            {
              "text": "你要几",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "杯",
              "emphasized": true,
              "role": "classifier"
            },
            {
              "text": "茶？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_366fff0d896542d0921adc449244e8df",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-014"
      ],
      "titleEn": "Units for dates, age, clock time, and duration",
      "targetFormZh": "日、号、岁、点、分、年、天",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express calendar dates, age, clock time, years, days, and minutes with the syllabus time-measure words.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "日",
            "号",
            "岁",
            "点",
            "分",
            "年",
            "天"
          ],
          "textEn": "Place the number directly before the time unit; these units do not take an extra classifier."
        }
      ],
      "watchOutEn": "日 and 号 can name a calendar date; 点 marks an hour on the clock, while 分 marks minutes.",
      "examples": [
        {
          "id": "gexample_25e9ec64c086476699c1c433cc32a510",
          "zh": "今天是五月一日。",
          "pinyin": "Jīntiān shì wǔ yuè yī rì.",
          "translationEn": "Today is May 1.",
          "analyses": [
            {
              "textEn": "日 follows the date number 一 in the formal calendar expression 五月一日."
            }
          ],
          "parts": [
            {
              "text": "今天是五月一",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "日",
              "emphasized": true,
              "role": "time_unit"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_9e2715b975194e9ba847d631e0c471c6",
          "zh": "我儿子十岁。",
          "pinyin": "Wǒ érzi shí suì.",
          "translationEn": "My son is ten years old.",
          "analyses": [
            {
              "textEn": "岁 follows 十 and measures the son's age in years."
            }
          ],
          "parts": [
            {
              "text": "我儿子十",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "岁",
              "emphasized": true,
              "role": "age_unit"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_16cda7aefaaf49eebd4327366d43cb10",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-015"
      ],
      "titleEn": "Basic degree adverbs",
      "targetFormZh": "非常、很、太、真、有（一）点儿",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express ordinary, strong, excessive, genuine, or mildly unfavorable degrees of a quality.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "非常",
            "很",
            "太",
            "真",
            "有（一）点儿"
          ],
          "textEn": "Place the degree adverb before the adjective or adjective-like predicate."
        },
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "非常",
            "很",
            "太",
            "真",
            "有（一）点儿"
          ],
          "textEn": "很 is often natural before a simple adjective even when 'very' is not strongly stressed."
        }
      ],
      "watchOutEn": "有一点儿 often presents a degree as less than ideal, while 一点儿 can also be a quantity expression.",
      "examples": [
        {
          "id": "gexample_f5c5a835d42b45cc92c32385fbfdc4c3",
          "zh": "今天天气很冷。",
          "pinyin": "Jīntiān tiānqì hěn lěng.",
          "translationEn": "The weather is cold today.",
          "analyses": [
            {
              "textEn": "很 links the topic 今天天气 to the adjective 冷 and gives it an ordinary degree reading."
            }
          ],
          "parts": [
            {
              "text": "今天天气",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "很",
              "emphasized": true,
              "role": "degree_adverb"
            },
            {
              "text": "冷。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_cc233499b3824dfa925317e57445ac1b",
          "zh": "这本书有一点儿贵。",
          "pinyin": "Zhè běn shū yǒu yìdiǎnr guì.",
          "translationEn": "This book is a little expensive.",
          "analyses": [
            {
              "textEn": "有一点儿 precedes 贵 and presents the degree of expense as mildly undesirable."
            }
          ],
          "parts": [
            {
              "text": "这本书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有一点儿",
              "emphasized": true,
              "role": "degree_adverb"
            },
            {
              "text": "贵。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_4352b1a2159746fd89c742e39cd0668f",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-016"
      ],
      "titleEn": "Including the whole set with 都",
      "targetFormZh": "都1",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express that a statement applies to every member of an already identified plural set.",
      "patterns": [
        {
          "labelEn": "Whole-set scope",
          "appliesToZh": [
            "都"
          ],
          "pattern": "Plural set + 都 + Predicate",
          "formationEn": "Place 都 after the set and before what is true of it.",
          "usageEn": "Says every member shares the following property or action."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "都"
          ],
          "textEn": "都 scopes over the set to its left, not a noun introduced later in the sentence."
        }
      ],
      "watchOutEn": "The plural or coordinated set normally comes before 都; 都 then stands before the predicate.",
      "examples": [
        {
          "id": "gexample_25425ae695f14bbfbf9b6e4180c3914c",
          "zh": "我们都是学生。",
          "pinyin": "Wǒmen dōu shì xuéshēng.",
          "translationEn": "We are all students.",
          "analyses": [
            {
              "textEn": "都 follows 我们 and distributes 是学生 over every person in that group."
            }
          ],
          "parts": [
            {
              "text": "我们",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "都",
              "emphasized": true,
              "role": "scope_adverb"
            },
            {
              "text": "是学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_8c709835d14e4f19818b3a58aeba7b11",
          "zh": "这些书都很好。",
          "pinyin": "Zhèxiē shū dōu hěn hǎo.",
          "translationEn": "These books are all good.",
          "analyses": [
            {
              "textEn": "都 follows the plural set 这些书 and makes 很好 apply to all of them."
            }
          ],
          "parts": [
            {
              "text": "这些书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "都",
              "emphasized": true,
              "role": "scope_adverb"
            },
            {
              "text": "很好。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_c0e91c4dabc54e16a54f81122db4616a",
          "zh": "他们都不喝茶。",
          "pinyin": "Tāmen dōu bù hē chá.",
          "translationEn": "None of them drink tea.",
          "analyses": [
            {
              "textEn": "都 follows 他们 and distributes the negative predicate 不喝茶 over every member of the group."
            }
          ],
          "parts": [
            {
              "text": "他们",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "都",
              "emphasized": true,
              "role": "scope_adverb"
            },
            {
              "text": "不喝茶。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_ba7347a31d784cbca5182e1d566478fe",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-017"
      ],
      "titleEn": "Actions in progress with 在 and 正在",
      "targetFormZh": "在、正在",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express that an action is underway now, with 正在 giving the ongoing moment extra focus.",
      "patterns": [
        {
          "labelEn": "Ongoing action",
          "appliesToZh": [
            "在",
            "正在"
          ],
          "pattern": "Subject + 在/正在 + Verb",
          "formationEn": "Put 在 or 正在 immediately before the action verb.",
          "usageEn": "Locates the action as currently in progress."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "在",
            "正在"
          ],
          "textEn": "正在 is more explicit and emphatic about the action being underway at the reference moment."
        }
      ],
      "watchOutEn": "This adverbial 在 comes directly before an action; locative 在 instead introduces a place.",
      "examples": [
        {
          "id": "gexample_500d8710344a48218dcb3a2d0b77bdeb",
          "zh": "我在看书。",
          "pinyin": "Wǒ zài kàn shū.",
          "translationEn": "I am reading.",
          "analyses": [
            {
              "textEn": "在 immediately precedes 看书 and marks the reading as ongoing."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "progressive_adverb"
            },
            {
              "text": "看书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_99b2c8a87f2f47a294805d8b4f17165e",
          "zh": "她正在吃饭。",
          "pinyin": "Tā zhèngzài chīfàn.",
          "translationEn": "She is eating right now.",
          "analyses": [
            {
              "textEn": "正在 before 吃饭 emphasizes that the meal is in progress at this moment."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "正在",
              "emphasized": true,
              "role": "progressive_adverb"
            },
            {
              "text": "吃饭。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7f212384634f484eac35768163f7b72b",
          "zh": "你在看什么？",
          "pinyin": "Nǐ zài kàn shénme?",
          "translationEn": "What are you looking at?",
          "analyses": [
            {
              "textEn": "在 directly precedes 看 and marks the action asked about as currently in progress."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "progressive_adverb"
            },
            {
              "text": "看什么？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_25b211801b454d9ba2a99a519ff3d998",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-018"
      ],
      "titleEn": "Doing something again with 再",
      "targetFormZh": "再1",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a repeated or additional action expected from the present point onward.",
      "patterns": [
        {
          "labelEn": "Future or requested repeat",
          "appliesToZh": [
            "再"
          ],
          "pattern": "再 + Verb",
          "formationEn": "Place 再 immediately before the repeated action.",
          "usageEn": "Requests or schedules another occurrence after now."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "再"
          ],
          "textEn": "A time expression such as 明天 can clarify when the later repetition will happen."
        }
      ],
      "watchOutEn": "At this level, 再 normally points to a repeat that has not happened yet in the current context.",
      "examples": [
        {
          "id": "gexample_6aaf0acb0a3245d8a9f6516832a0036c",
          "zh": "我明天再来。",
          "pinyin": "Wǒ míngtiān zài lái.",
          "translationEn": "I will come again tomorrow.",
          "analyses": [
            {
              "textEn": "再 precedes 来 and places another occurrence of coming on tomorrow's schedule."
            }
          ],
          "parts": [
            {
              "text": "我明天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "再",
              "emphasized": true,
              "role": "frequency_adverb"
            },
            {
              "text": "来。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_5e419924dc1b48c094112c2c166f0311",
          "zh": "请再说一下。",
          "pinyin": "Qǐng zài shuō yíxià.",
          "translationEn": "Please say it again.",
          "analyses": [
            {
              "textEn": "再 before 说 requests another performance, while 一下 keeps the request light."
            }
          ],
          "parts": [
            {
              "text": "请",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "再",
              "emphasized": true,
              "role": "frequency_adverb"
            },
            {
              "text": "说一下。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_7fb2f8481a4c4d02942993747c989fcc",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-019"
      ],
      "titleEn": "Adding information with 还 and 也",
      "targetFormZh": "还1、也",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express that another action, item, or participant is added to information already given.",
      "patterns": [
        {
          "labelEn": "Additive adverb",
          "appliesToZh": [
            "还",
            "也"
          ],
          "pattern": "Subject + 还/也 + Predicate",
          "formationEn": "Place the additive adverb before the added predicate.",
          "usageEn": "还 commonly adds another item; 也 says a parallel participant or fact likewise applies."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "还",
            "也"
          ],
          "textEn": "Both depend on prior or understood information; the sentence presents something as additional rather than isolated."
        }
      ],
      "watchOutEn": "This HSK 1 还 means 'also/in addition'; do not confuse it with later temporal or comparative uses.",
      "examples": [
        {
          "id": "gexample_ca5f185ce063468c8358e6409aeb5280",
          "zh": "我买了书，还买了水果。",
          "pinyin": "Wǒ mǎile shū, hái mǎile shuǐguǒ.",
          "translationEn": "I bought books and also bought fruit.",
          "analyses": [
            {
              "textEn": "还 introduces 买了水果 as an additional purchase after 买了书."
            }
          ],
          "parts": [
            {
              "text": "我买了书，",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "还",
              "emphasized": true,
              "role": "additive_adverb"
            },
            {
              "text": "买了水果。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_bdfb7ba3c5ba4c41be37c5aaebf2cbad",
          "zh": "他是学生，我也是学生。",
          "pinyin": "Tā shì xuéshēng, wǒ yě shì xuéshēng.",
          "translationEn": "He is a student, and I am a student too.",
          "analyses": [
            {
              "textEn": "也 before 是学生 marks the speaker as sharing the status already stated for 他."
            }
          ],
          "parts": [
            {
              "text": "他是学生，我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "也",
              "emphasized": true,
              "role": "additive_adverb"
            },
            {
              "text": "是学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_8045fc9617b844d1bea15d13eeab2498",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-020"
      ],
      "titleEn": "Negating habits, events, and commands",
      "targetFormZh": "不、没（有）、不要",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a general or intended negative with 不, deny a realized event or possession with 没（有）, and prohibit an action with 不要.",
      "patterns": [
        {
          "labelEn": "General negative",
          "appliesToZh": [
            "不"
          ],
          "pattern": "不 + Predicate",
          "formationEn": "Place 不 before the predicate.",
          "usageEn": "Negates a habitual, present, or intended situation."
        },
        {
          "labelEn": "Event or possession negative",
          "appliesToZh": [
            "没（有）"
          ],
          "pattern": "没（有） + Verb / 没有 + Noun phrase",
          "formationEn": "Use 没 or 没有 before an event, and use 没有 before a possessed item.",
          "usageEn": "Denies occurrence or possession."
        },
        {
          "labelEn": "Prohibition",
          "appliesToZh": [
            "不要"
          ],
          "pattern": "不要 + Verb",
          "formationEn": "Place 不要 before the prohibited action.",
          "usageEn": "Tells someone not to do something."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "不",
            "没（有）",
            "不要"
          ],
          "textEn": "Completed-event negation uses 没 without perfective 了."
        }
      ],
      "watchOutEn": "Do not use 不 to negate a completed event with 了; use 没 and normally omit 了.",
      "examples": [
        {
          "id": "gexample_cd0f96f9b8e447668b993a8ce5258d03",
          "zh": "我不喝茶。",
          "pinyin": "Wǒ bù hē chá.",
          "translationEn": "I do not drink tea.",
          "analyses": [
            {
              "textEn": "不 before 喝 presents tea-drinking as a general negative choice or habit."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "不",
              "emphasized": true,
              "role": "negator"
            },
            {
              "text": "喝茶。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_16cca6e5ff1447e5acce62ee0b2a59f4",
          "zh": "他昨天没有上班。",
          "pinyin": "Tā zuótiān méiyǒu shàngbān.",
          "translationEn": "He did not go to work yesterday.",
          "analyses": [
            {
              "textEn": "没有 precedes 上班 and denies that the past event occurred; no perfective 了 appears."
            }
          ],
          "parts": [
            {
              "text": "他昨天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "没有",
              "emphasized": true,
              "role": "negator"
            },
            {
              "text": "上班。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_b63afb3846454f29aef449936f7c5134",
          "zh": "不要说话。",
          "pinyin": "Búyào shuōhuà.",
          "translationEn": "Do not talk.",
          "analyses": [
            {
              "textEn": "不要 stands before 说话 and turns the clause into a prohibition."
            }
          ],
          "parts": [
            {
              "text": "不要",
              "emphasized": true,
              "role": "prohibitive"
            },
            {
              "text": "说话。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_774188c53155422ea5f9f9d9176814f4",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-021"
      ],
      "titleEn": "Introducing a time or place with 在",
      "targetFormZh": "在 + Time/Place",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express when or where an event happens by placing a time or place phrase after 在.",
      "patterns": [
        {
          "labelEn": "Event setting",
          "appliesToZh": [
            "在"
          ],
          "pattern": "Subject + 在 + Time/Place + Predicate",
          "formationEn": "Put 在 before the time or place and before the main predicate.",
          "usageEn": "Sets the event in a particular time or location."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "在"
          ],
          "textEn": "Keep the 在 phrase before the main action in this beginner pattern."
        }
      ],
      "watchOutEn": "Prepositional 在 introduces a setting before the main predicate; progressive 在 instead stands directly before an action and means it is underway.",
      "examples": [
        {
          "id": "gexample_81b039b2a20a46d8ae426c74a2869684",
          "zh": "我在学校学习汉语。",
          "pinyin": "Wǒ zài xuéxiào xuéxí Hànyǔ.",
          "translationEn": "I study Chinese at school.",
          "analyses": [
            {
              "textEn": "在 introduces 学校 as the location of 学习汉语 and the whole setting precedes the action."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "preposition"
            },
            {
              "text": "学校学习汉语。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_28be051c835d43068165a80323b30db3",
          "zh": "我在三点上课。",
          "pinyin": "Wǒ zài sān diǎn shàngkè.",
          "translationEn": "I have class at three o'clock.",
          "analyses": [
            {
              "textEn": "在 introduces 三点 as the time setting for 上课."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "preposition"
            },
            {
              "text": "三点上课。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_74aaea9ca06346b8b9c1126fb6e0915e",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-022"
      ],
      "titleEn": "Introducing companions and targets with 和 and 对",
      "targetFormZh": "和1、对",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express who accompanies an action with 和 and who an action or attitude is directed toward with 对.",
      "patterns": [
        {
          "labelEn": "Companion phrase",
          "appliesToZh": [
            "和"
          ],
          "pattern": "Subject + 和 + Person + Verb",
          "formationEn": "Place 和 before the companion and before the action.",
          "usageEn": "Identifies who participates together with the subject."
        },
        {
          "labelEn": "Target phrase",
          "appliesToZh": [
            "对"
          ],
          "pattern": "Subject + 对 + Person/Thing + Predicate",
          "formationEn": "Place 对 before the target.",
          "usageEn": "Directs the following action or attitude toward that target."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "和",
            "对"
          ],
          "textEn": "Both prepositional phrases normally appear before the main predicate."
        }
      ],
      "watchOutEn": "This 和1 heads a companion phrase before the action; 和2 joins equal words or phrases.",
      "examples": [
        {
          "id": "gexample_b119fdc0a20e4f38874b65b4c4a9506f",
          "zh": "我今天和朋友去学校。",
          "pinyin": "Wǒ jīntiān hé péngyou qù xuéxiào.",
          "translationEn": "I am going to school with a friend today.",
          "analyses": [
            {
              "textEn": "和 introduces 朋友 as the companion who goes with the subject."
            }
          ],
          "parts": [
            {
              "text": "我今天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "和",
              "emphasized": true,
              "role": "preposition"
            },
            {
              "text": "朋友去学校。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_654a52c8cce644b488a75d1cab87dc7e",
          "zh": "他对我说话。",
          "pinyin": "Tā duì wǒ shuōhuà.",
          "translationEn": "He speaks to me.",
          "analyses": [
            {
              "textEn": "对 introduces 我 as the person toward whom the speaking is directed."
            }
          ],
          "parts": [
            {
              "text": "他",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "对",
              "emphasized": true,
              "role": "preposition"
            },
            {
              "text": "我说话。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_54f27de8a6bb4f93ae2f2daaff909acb",
          "zh": "你和谁去学校？",
          "pinyin": "Nǐ hé shéi qù xuéxiào?",
          "translationEn": "Who are you going to school with?",
          "analyses": [
            {
              "textEn": "和 introduces the unknown companion 谁 before the shared action 去学校."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "和",
              "emphasized": true,
              "role": "preposition"
            },
            {
              "text": "谁去学校？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_0e77d991e9a346519efa66a6c5882497",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-023"
      ],
      "titleEn": "Joining equal words and phrases with 和",
      "targetFormZh": "和2",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a simple combination by joining two equal words or phrases with 和.",
      "patterns": [
        {
          "labelEn": "Coordinate link",
          "appliesToZh": [
            "和"
          ],
          "pattern": "A + 和 + B",
          "formationEn": "Place 和 between two constituents with the same grammatical role.",
          "usageEn": "Presents A and B as a combined set."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "和"
          ],
          "textEn": "A and B should be grammatically parallel, such as two nouns or two noun phrases."
        }
      ],
      "watchOutEn": "Conjunction 和 joins parallel constituents; it does not normally link two full event clauses in the beginner pattern.",
      "examples": [
        {
          "id": "gexample_d5a1ea5937f84a849ae3a710179b5b92",
          "zh": "我喜欢茶和牛奶。",
          "pinyin": "Wǒ xǐhuan chá hé niúnǎi.",
          "translationEn": "I like tea and milk.",
          "analyses": [
            {
              "textEn": "和 joins the two parallel objects 茶 and 牛奶 inside one object phrase."
            }
          ],
          "parts": [
            {
              "text": "我喜欢茶",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "和",
              "emphasized": true,
              "role": "conjunction"
            },
            {
              "text": "牛奶。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_ec9b8f0db2624a25b8e7a014f28feabe",
          "zh": "他买了苹果和鸡蛋。",
          "pinyin": "Tā mǎile píngguǒ hé jīdàn.",
          "translationEn": "He bought apples and eggs.",
          "analyses": [
            {
              "textEn": "和 coordinates 苹果 and 鸡蛋 as the two things bought."
            }
          ],
          "parts": [
            {
              "text": "他买了苹果",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "和",
              "emphasized": true,
              "role": "conjunction"
            },
            {
              "text": "鸡蛋。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_a74fcd39ad2c4fb59a14ed3cf69e5f45",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-024"
      ],
      "titleEn": "Linking a modifier to a noun with 的",
      "targetFormZh": "Modifier + 的1 + Noun",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express possession or describe which kind of person or thing you mean by linking a modifier to a noun with 的.",
      "patterns": [
        {
          "labelEn": "Attributive link",
          "appliesToZh": [
            "的"
          ],
          "pattern": "Modifier + 的 + Noun",
          "formationEn": "Place 的 after the modifier and before the noun it describes.",
          "usageEn": "Marks possession or another descriptive relationship."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "的"
          ],
          "textEn": "The modifier can be a pronoun, noun, or descriptive phrase."
        }
      ],
      "watchOutEn": "的 belongs between the modifier and its head noun; it is not a general word for 'of' that can be placed independently.",
      "examples": [
        {
          "id": "gexample_aeb1e2125c6c4a5abb2722bb73a5671d",
          "zh": "这是我的书。",
          "pinyin": "Zhè shì wǒ de shū.",
          "translationEn": "This is my book.",
          "analyses": [
            {
              "textEn": "的 links the possessor 我 to the possessed noun 书."
            }
          ],
          "parts": [
            {
              "text": "这是我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "的",
              "emphasized": true,
              "role": "structural_particle"
            },
            {
              "text": "书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_123b3c06a89847928bea4bc7545cbde2",
          "zh": "我喜欢好看的电影。",
          "pinyin": "Wǒ xǐhuan hǎokàn de diànyǐng.",
          "translationEn": "I like good movies.",
          "analyses": [
            {
              "textEn": "的 links 好看, meaning 'good to watch' here, to the noun 电影."
            }
          ],
          "parts": [
            {
              "text": "我喜欢好看",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "的",
              "emphasized": true,
              "role": "structural_particle"
            },
            {
              "text": "电影。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_fcaeee2d714f4bd1bb915c260cae0b17",
          "zh": "这是谁的杯子？",
          "pinyin": "Zhè shì shéi de bēizi?",
          "translationEn": "Whose cup is this?",
          "analyses": [
            {
              "textEn": "的 links the interrogative possessor 谁 to the head noun 杯子."
            }
          ],
          "parts": [
            {
              "text": "这是谁",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "的",
              "emphasized": true,
              "role": "structural_particle"
            },
            {
              "text": "杯子？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_1a09481348024cffac4caba31e71ccb6",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-025"
      ],
      "titleEn": "Bounded events with verb-final 了",
      "targetFormZh": "Verb + 了1 (+ Object)",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express that a bounded event has been realized or viewed as complete by placing 了 after its verb.",
      "patterns": [
        {
          "labelEn": "Perfective event",
          "appliesToZh": [
            "了"
          ],
          "pattern": "Verb + 了 (+ Object)",
          "formationEn": "Place 了 immediately after the event verb in this basic pattern.",
          "usageEn": "Presents the event as a bounded whole rather than an ongoing activity."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "了"
          ],
          "textEn": "Negate a nonoccurring completed event with 没 and normally remove perfective 了."
        }
      ],
      "watchOutEn": "Do not negate a completed event as *昨天不买了书. Say 昨天没买书: use 没 before the verb and omit perfective 了.",
      "examples": [
        {
          "id": "gexample_667757b4a0f94173a93434798236b75d",
          "zh": "我买了两本书。",
          "pinyin": "Wǒ mǎile liǎng běn shū.",
          "translationEn": "I bought two books.",
          "analyses": [
            {
              "textEn": "了 follows 买 and presents the two-book purchase as a realized, bounded event."
            }
          ],
          "parts": [
            {
              "text": "我买",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "aspect_particle"
            },
            {
              "text": "两本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_4a8276ab287c4322b723f74404f71934",
          "zh": "她吃了晚饭。",
          "pinyin": "Tā chīle wǎnfàn.",
          "translationEn": "She ate dinner.",
          "analyses": [
            {
              "textEn": "了 follows 吃 and views the dinner event as complete."
            }
          ],
          "parts": [
            {
              "text": "她吃",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "aspect_particle"
            },
            {
              "text": "晚饭。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_5d2c50688c034e27baf9d35328860a03",
          "zh": "你买了什么？",
          "pinyin": "Nǐ mǎile shénme?",
          "translationEn": "What did you buy?",
          "analyses": [
            {
              "textEn": "了 follows 买 and presents the purchase as realized while 什么 asks for its object."
            }
          ],
          "parts": [
            {
              "text": "你买",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "aspect_particle"
            },
            {
              "text": "什么？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_5a0310b4cf854089997508807c121c78",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-026"
      ],
      "titleEn": "Basic sentence-final particles",
      "targetFormZh": "吧1、了2、吗、呢1、呢2、呢3",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express a softened suggestion, a new situation, a yes-no question, an information question, a follow-up question, or an ongoing situation with a sentence-final particle.",
      "patterns": [
        {
          "labelEn": "Soft suggestion",
          "appliesToZh": [
            "吧"
          ],
          "pattern": "Suggestion + 吧",
          "formationEn": "Put 吧 at sentence end.",
          "usageEn": "Makes a proposed action sound less abrupt."
        },
        {
          "labelEn": "New situation",
          "appliesToZh": [
            "了"
          ],
          "pattern": "New situation + 了",
          "formationEn": "Put 了 at the end of the whole sentence.",
          "usageEn": "Signals that the current situation now differs from before."
        },
        {
          "labelEn": "Yes-no question",
          "appliesToZh": [
            "吗"
          ],
          "pattern": "Statement + 吗？",
          "formationEn": "Keep statement order and add 吗.",
          "usageEn": "Requests confirmation or denial."
        },
        {
          "labelEn": "Three HSK 1 uses of 呢",
          "appliesToZh": [
            "吧",
            "了",
            "吗",
            "呢"
          ],
          "pattern": "Information question + 呢 / Topic + 呢 / Ongoing clause + 呢",
          "formationEn": "Place 呢 at the end of the relevant question or ongoing clause.",
          "usageEn": "Preserve the indexed functions: question tone, topic follow-up, and ongoing situation."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "吧",
            "了",
            "吗",
            "呢"
          ],
          "textEn": "The syllabus indices distinguish functions; they are not pronounced and are not written in the Chinese sentence."
        }
      ],
      "watchOutEn": "These particles are not interchangeable: 吗 asks a neutral yes-no question, while 呢 does not turn an ordinary statement into that question type.",
      "examples": [
        {
          "id": "gexample_9671af513ca143ec8d871186361a00bd",
          "zh": "我们回家吧。",
          "pinyin": "Wǒmen huí jiā ba.",
          "translationEn": "Let's go home.",
          "analyses": [
            {
              "textEn": "吧 at sentence end softens 回家 into an inclusive suggestion."
            }
          ],
          "parts": [
            {
              "text": "我们回家",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吧",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7ba67025c3f645b3b0471a2169f9bb00",
          "zh": "下雨了。",
          "pinyin": "Xiàyǔ le.",
          "translationEn": "It has started raining.",
          "analyses": [
            {
              "textEn": "Sentence-final 了 presents rain as the new situation now in effect."
            }
          ],
          "parts": [
            {
              "text": "下雨",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_bf99e3b373664a7b87a3cde8d74107de",
          "zh": "你是学生吗？",
          "pinyin": "Nǐ shì xuéshēng ma?",
          "translationEn": "Are you a student?",
          "analyses": [
            {
              "textEn": "吗 converts the statement-order clause into a neutral yes-no question."
            }
          ],
          "parts": [
            {
              "text": "你是学生",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吗",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_2109e85839b04ccebda19296a0eeadce",
          "zh": "你在做什么呢？",
          "pinyin": "Nǐ zài zuò shénme ne?",
          "translationEn": "What are you doing?",
          "analyses": [
            {
              "textEn": "呢 closes a question already focused by 什么 and gives it a natural inquiring tone."
            }
          ],
          "parts": [
            {
              "text": "你在做什么",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_b256c4a6c82143e6949845ca7f9d61c4",
          "zh": "我很好，你呢？",
          "pinyin": "Wǒ hěn hǎo, nǐ ne?",
          "translationEn": "I'm well; how about you?",
          "analyses": [
            {
              "textEn": "你呢 reuses the preceding topic and asks the same question about 你 without repeating the predicate."
            }
          ],
          "parts": [
            {
              "text": "我很好，你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_743bdbe60134409e9af8a2a65709e041",
          "zh": "他看书呢。",
          "pinyin": "Tā kàn shū ne.",
          "translationEn": "He is reading.",
          "analyses": [
            {
              "textEn": "Sentence-final 呢 highlights 看书 as the ongoing situation."
            }
          ],
          "parts": [
            {
              "text": "他看书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "modal_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_b94351c5fad2413b9981abea6bd8ba95",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-027"
      ],
      "titleEn": "Getting attention with 喂",
      "targetFormZh": "喂",
      "categoryKey": "category-2",
      "categoryEn": "Word classes",
      "categoryZh": "词类",
      "purposeEn": "Express an attention-getting call, especially when beginning a phone exchange.",
      "patterns": [
        {
          "labelEn": "Attention call",
          "appliesToZh": [
            "喂"
          ],
          "pattern": "喂，+ Utterance",
          "formationEn": "Place 喂 before the utterance used to open the exchange.",
          "usageEn": "Gets the listener's attention before a greeting or question."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "喂"
          ],
          "textEn": "Intonation and context determine whether 喂 sounds neutral, urgent, or abrupt."
        }
      ],
      "watchOutEn": "喂 calls for attention; use 你好 for the greeting itself when appropriate.",
      "examples": [
        {
          "id": "gexample_4a5fa77523884990be5f98a99c90068d",
          "zh": "喂，你好！",
          "pinyin": "Wèi, nǐ hǎo!",
          "translationEn": "Hello!",
          "analyses": [
            {
              "textEn": "喂 opens the phone exchange by securing the listener's attention before the greeting."
            }
          ],
          "parts": [
            {
              "text": "喂",
              "emphasized": true,
              "role": "interjection"
            },
            {
              "text": "，你好！",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_322c0047e09a4d5ea7d946dec52b0862",
          "zh": "喂，请问你是谁？",
          "pinyin": "Wèi, qǐngwèn nǐ shì shéi?",
          "translationEn": "Hello, may I ask who this is?",
          "analyses": [
            {
              "textEn": "喂 stands outside the clause and opens the call before the polite question."
            }
          ],
          "parts": [
            {
              "text": "喂",
              "emphasized": true,
              "role": "interjection"
            },
            {
              "text": "，请问你是谁？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_8a50ad5ec1cf47199bad98e7b15fbbfb",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-028"
      ],
      "titleEn": "Coordinate phrases",
      "targetFormZh": "联合短语：A + B",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express two parallel people, things, or actions as one coordinated phrase.",
      "patterns": [
        {
          "labelEn": "Parallel coordination",
          "appliesToZh": [
            "联合短语：A + B"
          ],
          "pattern": "A + (和) + B",
          "formationEn": "Place compatible constituents side by side, optionally linked by 和 where natural.",
          "usageEn": "Treats the constituents as a combined set or sequence."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "联合短语：A + B"
          ],
          "textEn": "Nouns commonly use 和; compact paired expressions can occur directly side by side."
        }
      ],
      "watchOutEn": "The coordinated parts should have equal status and a compatible grammatical role.",
      "examples": [
        {
          "id": "gexample_77d2854eee864747b1d941a44c0cc2d0",
          "zh": "爸爸妈妈都在家。",
          "pinyin": "Bàba māma dōu zài jiā.",
          "translationEn": "Dad and Mom are both at home.",
          "analyses": [
            {
              "textEn": "爸爸妈妈 coordinates two kinship nouns as the plural subject of the sentence."
            }
          ],
          "parts": [
            {
              "text": "爸爸妈妈",
              "emphasized": true,
              "role": "coordinate_phrase"
            },
            {
              "text": "都在家。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7dc0488344324c9984c487d9ff97dd98",
          "zh": "我喜欢读书和写字。",
          "pinyin": "Wǒ xǐhuan dúshū hé xiězì.",
          "translationEn": "I like reading and writing.",
          "analyses": [
            {
              "textEn": "读书 and 写字 are parallel verb-object phrases joined by 和 as one object of 喜欢."
            }
          ],
          "parts": [
            {
              "text": "我喜欢",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "读书和写字",
              "emphasized": true,
              "role": "coordinate_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_2168b15d20824e47b75dfa55e28dbf3b",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-029"
      ],
      "titleEn": "Modifier-head phrases",
      "targetFormZh": "偏正短语：Modifier + Head",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express a more specific person or thing by placing descriptive or identifying material before its head word.",
      "patterns": [
        {
          "labelEn": "Preposed modifier",
          "appliesToZh": [
            "偏正短语：Modifier + Head"
          ],
          "pattern": "Modifier + (的) + Head",
          "formationEn": "Put the modifier before the head and use 的 when the relationship requires it.",
          "usageEn": "Identifies which person, thing, place, or type is meant."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "偏正短语：Modifier + Head"
          ],
          "textEn": "The head carries the phrase's basic category; the earlier material modifies it."
        }
      ],
      "watchOutEn": "Mandarin modifiers precede the head they describe; do not copy English noun-modifier order.",
      "examples": [
        {
          "id": "gexample_a505dc844b314f3d95015f4ebe902258",
          "zh": "这是我的书。",
          "pinyin": "Zhè shì wǒ de shū.",
          "translationEn": "This is my book.",
          "analyses": [
            {
              "textEn": "我的 modifies the head noun 书, and the whole phrase means 'my book.'"
            }
          ],
          "parts": [
            {
              "text": "这是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "我的书",
              "emphasized": true,
              "role": "modifier_head_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_59e26c8f7c6447a9a51f5759eabcc159",
          "zh": "我喜欢好看的电影。",
          "pinyin": "Wǒ xǐhuan hǎokàn de diànyǐng.",
          "translationEn": "I like good movies.",
          "analyses": [
            {
              "textEn": "好看的, meaning 'good to watch' here, modifies the head noun 电影."
            }
          ],
          "parts": [
            {
              "text": "我喜欢",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "好看的电影",
              "emphasized": true,
              "role": "modifier_head_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_1fc581dad530442fa886235a4e4f7d9d",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-030"
      ],
      "titleEn": "Verb-object phrases",
      "targetFormZh": "动宾短语：Verb + Object",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express an action together with the person or thing directly involved in it.",
      "patterns": [
        {
          "labelEn": "Action and object",
          "appliesToZh": [
            "动宾短语：Verb + Object"
          ],
          "pattern": "Verb + Object",
          "formationEn": "Place the object directly after the transitive verb.",
          "usageEn": "Names an action together with what it affects or involves."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "动宾短语：Verb + Object"
          ],
          "textEn": "A verb-object phrase can function as the predicate or as part of a larger construction."
        }
      ],
      "watchOutEn": "The object follows the verb in the neutral basic order.",
      "examples": [
        {
          "id": "gexample_e671edf0c9e24754a417f02b02033e1d",
          "zh": "我看书。",
          "pinyin": "Wǒ kàn shū.",
          "translationEn": "I read books.",
          "analyses": [
            {
              "textEn": "看 is the verb and 书 is its following object, together forming 看书."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "看书",
              "emphasized": true,
              "role": "verb_object_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_7e571d41b4ce489b827af4eabce08263",
          "zh": "她在吃饭。",
          "pinyin": "Tā zài chīfàn.",
          "translationEn": "She is eating.",
          "analyses": [
            {
              "textEn": "吃 and its object-like component 饭 form the verb-object expression 吃饭 inside the predicate 在吃饭."
            }
          ],
          "parts": [
            {
              "text": "她在",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吃饭",
              "emphasized": true,
              "role": "verb_object_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_4d919eed7b9347febdef9633d1781586",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-031"
      ],
      "titleEn": "Subject-predicate phrases",
      "targetFormZh": "主谓短语：Subject + Predicate",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express a small proposition in which a subject is described by its own predicate, including when that proposition sits inside a larger sentence.",
      "patterns": [
        {
          "labelEn": "Small proposition",
          "appliesToZh": [
            "主谓短语：Subject + Predicate"
          ],
          "pattern": "Subject + Predicate",
          "formationEn": "Place the internal topic or subject before what is said about it.",
          "usageEn": "Forms a proposition that can stand alone or fill a role in a larger sentence."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "主谓短语：Subject + Predicate"
          ],
          "textEn": "Identify the internal relationship first: who or what is the predicate about?"
        }
      ],
      "watchOutEn": "A subject-predicate phrase contains its own subject and predicate but does not always stand alone as the whole sentence.",
      "examples": [
        {
          "id": "gexample_73a7f0704ba64e8b8ee1a02accacf11a",
          "zh": "我觉得天气很好。",
          "pinyin": "Wǒ juéde tiānqì hěn hǎo.",
          "translationEn": "I think the weather is very good.",
          "analyses": [
            {
              "textEn": "天气 is the internal subject and 很好 its predicate; 天气很好 is the proposition after 觉得."
            }
          ],
          "parts": [
            {
              "text": "我觉得",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "天气很好",
              "emphasized": true,
              "role": "subject_predicate_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_5434641f4e9542e2bfd0bc382a08b1a2",
          "zh": "我知道他是老师。",
          "pinyin": "Wǒ zhīdào tā shì lǎoshī.",
          "translationEn": "I know that he is a teacher.",
          "analyses": [
            {
              "textEn": "他 is the internal subject of 是老师, and the whole proposition follows 知道."
            }
          ],
          "parts": [
            {
              "text": "我知道",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "他是老师",
              "emphasized": true,
              "role": "subject_predicate_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_550e903fb0ab4a659570c5c0220af87d",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-032"
      ],
      "titleEn": "Numeral-measure phrases",
      "targetFormZh": "数量短语：Numeral + Measure word",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express a measured quantity by combining a number with its classifier or measurement unit.",
      "patterns": [
        {
          "labelEn": "Measured quantity",
          "appliesToZh": [
            "数词 + 量词"
          ],
          "pattern": "Numeral + Measure word",
          "formationEn": "Place the measure word immediately after the numeral.",
          "usageEn": "Counts or measures a noun, stated or understood."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "数词 + 量词"
          ],
          "textEn": "The numeral and measure word form a unit before the noun."
        }
      ],
      "watchOutEn": "Choose the classifier that matches the following noun even when the noun is omitted from the short quantity phrase.",
      "examples": [
        {
          "id": "gexample_46c5e82c4eac455990e2c91a6d57f248",
          "zh": "我买了三本书。",
          "pinyin": "Wǒ mǎile sān běn shū.",
          "translationEn": "I bought three books.",
          "analyses": [
            {
              "textEn": "三本 combines the numeral 三 with the book classifier 本 before 书."
            }
          ],
          "parts": [
            {
              "text": "我买了",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "三本",
              "emphasized": true,
              "role": "numeral_measure_phrase"
            },
            {
              "text": "书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_e31fa1c965854244a062d82b6a14ae05",
          "zh": "她买了两件衣服。",
          "pinyin": "Tā mǎile liǎng jiàn yīfu.",
          "translationEn": "She bought two items of clothing.",
          "analyses": [
            {
              "textEn": "两件 is a numeral-measure phrase that quantifies the following 衣服."
            }
          ],
          "parts": [
            {
              "text": "她买了",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "两件",
              "emphasized": true,
              "role": "numeral_measure_phrase"
            },
            {
              "text": "衣服。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_41e182210a224d769b4e53e139b132d4",
          "zh": "你要几个？",
          "pinyin": "Nǐ yào jǐ ge?",
          "translationEn": "How many do you want?",
          "analyses": [
            {
              "textEn": "几个 is a numeral-measure phrase with an interrogative numeral; the counted noun is understood from context."
            }
          ],
          "parts": [
            {
              "text": "你要",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "几个",
              "emphasized": true,
              "role": "numeral_measure_phrase"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_627f84e67bba43b397e2c78ba24d0683",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-033"
      ],
      "titleEn": "Preposition-object phrases",
      "targetFormZh": "介宾短语：Preposition + Object",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express a setting, companion, or target as a phrase headed by a preposition.",
      "patterns": [
        {
          "labelEn": "Prepositional phrase",
          "appliesToZh": [
            "介词 + 宾语"
          ],
          "pattern": "Preposition + Noun/Pronoun phrase",
          "formationEn": "Place the object immediately after 在, 和, 对, or another licensed preposition.",
          "usageEn": "Adds a time, place, companion, or target to the clause."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "介词 + 宾语"
          ],
          "textEn": "At HSK 1, the complete phrase normally precedes the main action."
        }
      ],
      "watchOutEn": "The object belongs directly after its preposition; move the complete phrase together when it modifies an action.",
      "examples": [
        {
          "id": "gexample_7de0d4aa46af4629a53b2f4ac3c31fd8",
          "zh": "我在学校学习。",
          "pinyin": "Wǒ zài xuéxiào xuéxí.",
          "translationEn": "I study at school.",
          "analyses": [
            {
              "textEn": "在学校 contains preposition 在 and object 学校; the whole phrase sets the location of 学习."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在学校",
              "emphasized": true,
              "role": "preposition_object_phrase"
            },
            {
              "text": "学习。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_b94dfcacac86441fb4bb2737947714a5",
          "zh": "他对我说话。",
          "pinyin": "Tā duì wǒ shuōhuà.",
          "translationEn": "He speaks to me.",
          "analyses": [
            {
              "textEn": "对我 combines 对 with its pronoun object 我 and identifies the target of speaking."
            }
          ],
          "parts": [
            {
              "text": "他",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "对我",
              "emphasized": true,
              "role": "preposition_object_phrase"
            },
            {
              "text": "说话。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_9a5f822d74fe4c839e358a1bc3acfd9b",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-034"
      ],
      "titleEn": "Location phrases",
      "targetFormZh": "方位短语：Reference + Location noun",
      "categoryKey": "category-3",
      "categoryEn": "Phrases",
      "categoryZh": "短语",
      "purposeEn": "Express a location relative to a known place or object by adding a location noun after it.",
      "patterns": [
        {
          "labelEn": "Relative location",
          "appliesToZh": [
            "处所/物体 + 方位名词"
          ],
          "pattern": "Reference noun + 上/下/里/外/前/后",
          "formationEn": "Place the location noun after its reference.",
          "usageEn": "Names a region relative to that reference."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "处所/物体 + 方位名词"
          ],
          "textEn": "The resulting phrase can follow 在 or serve as the place before 有."
        }
      ],
      "watchOutEn": "The reference comes first and the relative location follows: 桌子上, 房间里.",
      "examples": [
        {
          "id": "gexample_317f574714274eeda44a2d010b955f20",
          "zh": "书在桌子上。",
          "pinyin": "Shū zài zhuōzi shàng.",
          "translationEn": "The book is on the table.",
          "analyses": [
            {
              "textEn": "桌子上 combines the reference 桌子 with 上 to name its upper surface."
            }
          ],
          "parts": [
            {
              "text": "书在",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "桌子上",
              "emphasized": true,
              "role": "location_phrase"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_1b77b0722365444b9e922bbc60dabf97",
          "zh": "房间里有一只猫。",
          "pinyin": "Fángjiān lǐ yǒu yì zhī māo.",
          "translationEn": "There is a cat in the room.",
          "analyses": [
            {
              "textEn": "房间里 combines 房间 with 里 and serves as the place where the cat exists."
            }
          ],
          "parts": [
            {
              "text": "房间里",
              "emphasized": true,
              "role": "location_phrase"
            },
            {
              "text": "有一只猫。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_29e6003d76324040b5569af989f757da",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-035"
      ],
      "titleEn": "Nouns and pronouns as subjects",
      "targetFormZh": "名词作主语；代词作主语；名词性短语作主语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express who or what a sentence is about by placing a noun, pronoun, or nominal phrase in subject position.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "名词作主语",
            "代词作主语",
            "名词性短语作主语"
          ],
          "textEn": "The subject normally precedes the predicate in the neutral order."
        }
      ],
      "watchOutEn": "Subject is a grammatical role, not a fixed word class; a complete nominal phrase can fill it as one unit.",
      "examples": [
        {
          "id": "gexample_97bca6c8a1ef482d8cf9379ee426028c",
          "zh": "学生在看书。",
          "pinyin": "Xuéshēng zài kàn shū.",
          "translationEn": "The students are reading.",
          "analyses": [
            {
              "textEn": "学生 is a noun in the subject position before the predicate 在看书."
            }
          ],
          "parts": [
            {
              "text": "学生",
              "emphasized": true,
              "role": "subject"
            },
            {
              "text": "在看书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_9265c95b75864ce7b60957c795af061b",
          "zh": "他们都很高兴。",
          "pinyin": "Tāmen dōu hěn gāoxìng.",
          "translationEn": "They are all very happy.",
          "analyses": [
            {
              "textEn": "他们 is the pronoun subject about which 都很高兴 is stated."
            }
          ],
          "parts": [
            {
              "text": "他们",
              "emphasized": true,
              "role": "subject"
            },
            {
              "text": "都很高兴。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_4eb138b94d8f4d2995ed9c5d082a8f28",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-036"
      ],
      "titleEn": "Nominal and quantity predicates",
      "targetFormZh": "名词作谓语；代词作谓语；数词作谓语；数量短语作谓语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Use a noun, pronoun-like form, numeral, or numeral-measure phrase directly as the predicate in licensed calendar, ownership, age, and quantity contexts.",
      "patterns": [],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "名词作谓语",
            "代词作谓语",
            "数词作谓语",
            "数量短语作谓语"
          ],
          "textEn": "Common HSK 1 nominal-predicate domains include dates, weekdays, age, and measured values."
        }
      ],
      "watchOutEn": "Do not generalize this restricted pattern: *他老师 is incorrect for ordinary class membership; say 他是老师.",
      "examples": [
        {
          "id": "gexample_1dff9dee5dee4d5b9e42d971ebe01593",
          "zh": "明天星期日。",
          "pinyin": "Míngtiān xīngqīrì.",
          "translationEn": "Tomorrow is Sunday.",
          "analyses": [
            {
              "textEn": "星期日 is the noun predicate giving the calendar identity of 明天 without 是."
            }
          ],
          "parts": [
            {
              "text": "明天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "星期日",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_f99978af8dcd4825a07b68bc70506426",
          "zh": "我儿子十岁。",
          "pinyin": "Wǒ érzi shí suì.",
          "translationEn": "My son is ten years old.",
          "analyses": [
            {
              "textEn": "十岁 is a quantity phrase used directly as the age predicate of 我儿子."
            }
          ],
          "parts": [
            {
              "text": "我儿子",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "十岁",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_b2e840fd7030439d994eae1859295cce",
          "zh": "这本书我的，那本你的。",
          "pinyin": "Zhè běn shū wǒ de, nà běn nǐ de.",
          "translationEn": "This book is mine, and that one is yours.",
          "analyses": [
            {
              "textEn": "我的 and 你的 are possessive pronoun-like expressions used directly as predicates without 是."
            }
          ],
          "parts": [
            {
              "text": "这本书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "我的",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "，那本",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "你的",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_a7ca54ff385649f5a6c3f1bfa66f4cba",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-037"
      ],
      "titleEn": "Verbal and adjectival predicates",
      "targetFormZh": "动词或动词性短语作谓语；形容词或形容词性短语作谓语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express what a subject does with a verbal predicate or what it is like with an adjectival predicate.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "动词或动词性短语作谓语",
            "形容词或形容词性短语作谓语"
          ],
          "textEn": "Place either predicate type after the subject in the neutral simple sentence."
        }
      ],
      "watchOutEn": "A Mandarin adjective can be the predicate without 是; a degree adverb such as 很 is often natural before it.",
      "examples": [
        {
          "id": "gexample_f24e41bdddf74ae59975f93cde712c1b",
          "zh": "我妹妹学习汉语。",
          "pinyin": "Wǒ mèimei xuéxí Hànyǔ.",
          "translationEn": "My younger sister studies Chinese.",
          "analyses": [
            {
              "textEn": "学习汉语 is the verbal predicate stating the subject's activity."
            }
          ],
          "parts": [
            {
              "text": "我妹妹",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "学习汉语",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_e43e8adc03154f4fad8cbdf86251b128",
          "zh": "这件衣服很漂亮。",
          "pinyin": "Zhè jiàn yīfu hěn piàoliang.",
          "translationEn": "This item of clothing is beautiful.",
          "analyses": [
            {
              "textEn": "很漂亮 is an adjectival predicate describing 这件衣服 without using 是."
            }
          ],
          "parts": [
            {
              "text": "这件衣服",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "很漂亮",
              "emphasized": true,
              "role": "predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_537d191c1b5c4bb596cb5b0152173131",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-038"
      ],
      "titleEn": "Nouns and pronouns as objects",
      "targetFormZh": "名词作宾语；代词作宾语；名词性短语作宾语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express the participant or thing selected by a verb using a noun, pronoun, or complete nominal phrase as its object.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "名词作宾语",
            "代词作宾语",
            "名词性短语作宾语"
          ],
          "textEn": "Identify the verb first, then ask what or whom it directly selects."
        }
      ],
      "watchOutEn": "The object normally follows its verb in basic word order and may contain its own modifiers.",
      "examples": [
        {
          "id": "gexample_663f7e0aa5cb4ac69d93357d5f938539",
          "zh": "我喜欢电影。",
          "pinyin": "Wǒ xǐhuan diànyǐng.",
          "translationEn": "I like movies.",
          "analyses": [
            {
              "textEn": "电影 is the noun object selected by 喜欢."
            }
          ],
          "parts": [
            {
              "text": "我喜欢",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "电影",
              "emphasized": true,
              "role": "object"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_d0324fa46ebb4bd9a569119e95f2d0d8",
          "zh": "老师认识他们。",
          "pinyin": "Lǎoshī rènshi tāmen.",
          "translationEn": "The teacher knows them.",
          "analyses": [
            {
              "textEn": "他们 is the pronoun object directly following 认识."
            }
          ],
          "parts": [
            {
              "text": "老师认识",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "他们",
              "emphasized": true,
              "role": "object"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_51e96c4e70c34846a993f05419ab1388",
          "zh": "你喜欢哪本书？",
          "pinyin": "Nǐ xǐhuan nǎ běn shū?",
          "translationEn": "Which book do you like?",
          "analyses": [
            {
              "textEn": "哪本书 is a complete interrogative nominal phrase functioning as the object of 喜欢."
            }
          ],
          "parts": [
            {
              "text": "你喜欢",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "哪本书",
              "emphasized": true,
              "role": "object"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_27ecd777a2564adaafe8770a1d6b61ba",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-039"
      ],
      "titleEn": "Nominal, descriptive, and quantity attributives",
      "targetFormZh": "名词性词语作定语；形容词性短语作定语；数量短语作定语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express whose item, what kind of item, or how many items by placing an attributive before the head noun.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "名词性词语作定语",
            "形容词性短语作定语",
            "数量短语作定语"
          ],
          "textEn": "The attributive and head noun form one larger nominal phrase."
        }
      ],
      "watchOutEn": "Attributives precede the noun; use 的 for possession and many descriptions, but a numeral-measure phrase normally attaches without 的.",
      "examples": [
        {
          "id": "gexample_f855b8f080f04926a286eebb269b339b",
          "zh": "这是老师的书。",
          "pinyin": "Zhè shì lǎoshī de shū.",
          "translationEn": "This is the teacher's book.",
          "analyses": [
            {
              "textEn": "老师的 is a nominal possessive attributive placed before the head noun 书."
            }
          ],
          "parts": [
            {
              "text": "这是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "老师的",
              "emphasized": true,
              "role": "attributive"
            },
            {
              "text": "书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_8640feea6a7c4f4e88f02c2d5e867a20",
          "zh": "我买了两本书。",
          "pinyin": "Wǒ mǎile liǎng běn shū.",
          "translationEn": "I bought two books.",
          "analyses": [
            {
              "textEn": "两本 is a numeral-measure attributive directly quantifying the head noun 书."
            }
          ],
          "parts": [
            {
              "text": "我买了",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "两本",
              "emphasized": true,
              "role": "attributive"
            },
            {
              "text": "书。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_fc44a931c80d4e79b32a28b5c7e4c29c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-040"
      ],
      "titleEn": "Adverbs, qualities, time, and place as adverbials",
      "targetFormZh": "副词作状语；形容词作状语；时间词语作状语；处所词语作状语",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express degree, manner-like quality, time, or place as information that frames or modifies a predicate.",
      "patterns": [],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "副词作状语",
            "形容词作状语",
            "时间词语作状语",
            "处所词语作状语"
          ],
          "textEn": "Order broad time before place, then place the most tightly linked adverb near its predicate."
        }
      ],
      "watchOutEn": "Time and place adverbials normally precede the main action; degree adverbs stand immediately before what they modify.",
      "examples": [
        {
          "id": "gexample_5c389a20dd2e4c9fa0359864272a2c8e",
          "zh": "她非常高兴。",
          "pinyin": "Tā fēicháng gāoxìng.",
          "translationEn": "She is very happy.",
          "analyses": [
            {
              "textEn": "非常 is an adverbial immediately modifying the degree of 高兴."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "非常",
              "emphasized": true,
              "role": "adverbial"
            },
            {
              "text": "高兴。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_a42945755bc44be5be3ba4375814fb98",
          "zh": "我今天在学校学习。",
          "pinyin": "Wǒ jīntiān zài xuéxiào xuéxí.",
          "translationEn": "I am studying at school today.",
          "analyses": [
            {
              "textEn": "今天 frames 学习 as the time adverbial."
            },
            {
              "textEn": "在学校 frames 学习 as the place adverbial after the time expression."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "今天",
              "emphasized": true,
              "role": "adverbial"
            },
            {
              "text": "在学校",
              "emphasized": true,
              "role": "adverbial"
            },
            {
              "text": "学习。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_9b197fe839304303a4d8f210a2b2ea55",
          "zh": "请多喝水。",
          "pinyin": "Qǐng duō hē shuǐ.",
          "translationEn": "Please drink more water.",
          "analyses": [
            {
              "textEn": "多 functions adverbially before 喝水 and increases the requested amount or frequency of drinking."
            }
          ],
          "parts": [
            {
              "text": "请",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "多",
              "emphasized": true,
              "role": "adverbial"
            },
            {
              "text": "喝水。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_59f6ebf93bea45fc8fd173609a6b93f7",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-041"
      ],
      "titleEn": "Short verbal quantity with 一下",
      "targetFormZh": "Verb + Verbal-measure complement (一下)",
      "categoryKey": "category-4",
      "categoryEn": "Sentence components",
      "categoryZh": "句子成分",
      "purposeEn": "Express one brief or light performance of an action by adding the verbal-measure complement 一下.",
      "patterns": [
        {
          "labelEn": "Brief action",
          "appliesToZh": [
            "动词 + 一下"
          ],
          "pattern": "Verb + 一下 (+ Object)",
          "formationEn": "Place 一下 immediately after the verb.",
          "usageEn": "Presents the action as brief, limited, or lightly requested."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "动词 + 一下"
          ],
          "textEn": "In requests, 一下 can reduce the weight of the command without removing its action-measure meaning."
        }
      ],
      "watchOutEn": "一下 follows the verb it measures; it often makes a request sound lighter, but it still contributes a short-action meaning.",
      "examples": [
        {
          "id": "gexample_e05bfa1ed08945f0be38de46dce6d173",
          "zh": "请看一下这本书。",
          "pinyin": "Qǐng kàn yíxià zhè běn shū.",
          "translationEn": "Please take a look at this book.",
          "analyses": [
            {
              "textEn": "一下 follows 看 and presents the requested look as brief and limited."
            }
          ],
          "parts": [
            {
              "text": "请看",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "一下",
              "emphasized": true,
              "role": "quantity_complement"
            },
            {
              "text": "这本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_38376ef72b704929b9f9ac4706342a34",
          "zh": "请说一下你的名字。",
          "pinyin": "Qǐng shuō yíxià nǐ de míngzi.",
          "translationEn": "Please say your name.",
          "analyses": [
            {
              "textEn": "一下 follows 说 and makes the request to say your name brief and less abrupt."
            }
          ],
          "parts": [
            {
              "text": "请说",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "一下",
              "emphasized": true,
              "role": "quantity_complement"
            },
            {
              "text": "你的名字。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_d3d1433d431346659fad3a64d2d182b4",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-042"
      ],
      "titleEn": "Verb-predicate sentences",
      "targetFormZh": "主语 + 动词/动词性短语",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express what a subject does, experiences, or has with a verb or verbal phrase as the main predicate.",
      "patterns": [
        {
          "labelEn": "Verbal predication",
          "appliesToZh": [
            "主谓句1：动词谓语句"
          ],
          "pattern": "Subject + Verbal predicate",
          "formationEn": "Place the subject before the verb or verbal phrase.",
          "usageEn": "States an action, event, experience, or verbal relation."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "主谓句1：动词谓语句"
          ],
          "textEn": "This is a sentence classification based on the predicate's grammatical type."
        }
      ],
      "watchOutEn": "The predicate can include an object or other material; identify the main verb that anchors it.",
      "examples": [
        {
          "id": "gexample_78219a5ebee94381a9e20eebae241418",
          "zh": "我学习汉语。",
          "pinyin": "Wǒ xuéxí Hànyǔ.",
          "translationEn": "I study Chinese.",
          "analyses": [
            {
              "textEn": "我 is the subject and 学习汉语 is the verbal predicate centered on 学习."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "学习汉语",
              "emphasized": true,
              "role": "verbal_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_dc3ec87c0a4e4ffdae2c376758de7840",
          "zh": "他有两本书。",
          "pinyin": "Tā yǒu liǎng běn shū.",
          "translationEn": "He has two books.",
          "analyses": [
            {
              "textEn": "有两本书 is a verbal predicate headed by 有 and states possession about 他."
            }
          ],
          "parts": [
            {
              "text": "他",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有两本书",
              "emphasized": true,
              "role": "verbal_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_65cef66ccadb4bda94ba9c6ba8ee5533",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-043"
      ],
      "titleEn": "Adjective-predicate sentences",
      "targetFormZh": "主语 + 形容词/形容词性短语",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a subject's quality or condition directly with an adjective or adjectival phrase as predicate.",
      "patterns": [
        {
          "labelEn": "Adjectival predication",
          "appliesToZh": [
            "主谓句2：形容词谓语句"
          ],
          "pattern": "Subject + Degree adverb + Adjective",
          "formationEn": "Place the adjectival predicate after the subject, commonly with 很 or another degree adverb.",
          "usageEn": "Describes a quality or condition without a copular 是."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "主谓句2：形容词谓语句"
          ],
          "textEn": "A bare adjective can sound contrastive; 很 often gives a neutral descriptive reading."
        }
      ],
      "watchOutEn": "Do not insert 是 before a basic adjective predicate. Use 她很高兴, not 她是很高兴 for the neutral HSK 1 statement.",
      "examples": [
        {
          "id": "gexample_db7e9f6f44d14fff988abf25d0abae84",
          "zh": "她很高兴。",
          "pinyin": "Tā hěn gāoxìng.",
          "translationEn": "She is happy.",
          "analyses": [
            {
              "textEn": "很高兴 is the adjectival predicate describing 她, with no 是."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "很高兴",
              "emphasized": true,
              "role": "adjectival_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_55cab6f196e04f7c9aa3540d6ac99bb0",
          "zh": "今天太热了。",
          "pinyin": "Jīntiān tài rè le.",
          "translationEn": "It is too hot today.",
          "analyses": [
            {
              "textEn": "太热了 is the adjectival predicate describing today's weather condition."
            }
          ],
          "parts": [
            {
              "text": "今天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "太热了",
              "emphasized": true,
              "role": "adjectival_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_547925aef0924951b412525be204599d",
          "zh": "这件衣服不贵。",
          "pinyin": "Zhè jiàn yīfu bú guì.",
          "translationEn": "This item of clothing is not expensive.",
          "analyses": [
            {
              "textEn": "不贵 is the negative adjectival predicate describing 这件衣服, with no copular 是."
            }
          ],
          "parts": [
            {
              "text": "这件衣服",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "不贵",
              "emphasized": true,
              "role": "adjectival_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_605ba97eb84f4d5980bf26497ddab505",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-044"
      ],
      "titleEn": "Noun-predicate sentences",
      "targetFormZh": "主语 + 名词/数量表达",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express dates, weekdays, age, or similar conventional information with a noun-like expression directly as predicate.",
      "patterns": [
        {
          "labelEn": "Direct nominal predication",
          "appliesToZh": [
            "主谓句3：名词谓语句"
          ],
          "pattern": "Subject + Nominal expression",
          "formationEn": "Place the date, age, or other licensed nominal expression directly after the subject.",
          "usageEn": "Gives conventional calendar, age, or quantity information."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "主谓句3：名词谓语句"
          ],
          "textEn": "Use this construction only in established nominal-predicate domains at this level."
        }
      ],
      "watchOutEn": "This direct pattern is conventional and limited; ordinary identity or class membership normally uses 是.",
      "examples": [
        {
          "id": "gexample_5c086316b84042b6a32d0b8ffb1fc037",
          "zh": "今天五月一号。",
          "pinyin": "Jīntiān wǔ yuè yī hào.",
          "translationEn": "Today is May 1.",
          "analyses": [
            {
              "textEn": "五月一号 is a calendar-date nominal predicate directly following 今天."
            }
          ],
          "parts": [
            {
              "text": "今天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "五月一号",
              "emphasized": true,
              "role": "nominal_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_8b13136878f04f6d91b1cbed6f61242c",
          "zh": "我妹妹十八岁。",
          "pinyin": "Wǒ mèimei shíbā suì.",
          "translationEn": "My younger sister is eighteen years old.",
          "analyses": [
            {
              "textEn": "十八岁 is an age expression functioning directly as the predicate of 我妹妹."
            }
          ],
          "parts": [
            {
              "text": "我妹妹",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "十八岁",
              "emphasized": true,
              "role": "nominal_predicate"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_30e3fcafb95040e2a6f3deee108b10e8",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-045"
      ],
      "titleEn": "Sentences without an explicit subject",
      "targetFormZh": "非主谓句",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a complete situational message without stating a separate subject when context makes one unnecessary.",
      "patterns": [],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "非主谓句"
          ],
          "textEn": "Weather statements, calls, and short situational expressions commonly use this form."
        }
      ],
      "watchOutEn": "Do not invent a hidden noun for analysis when the sentence conventionally presents the situation as a whole.",
      "examples": [
        {
          "id": "gexample_4be65931318d4f3a94de9adaf7559e07",
          "zh": "下雨了。",
          "pinyin": "Xiàyǔ le.",
          "translationEn": "It has started raining.",
          "analyses": [
            {
              "textEn": "The weather event 下雨了 forms the whole message without a separate grammatical subject."
            }
          ],
          "parts": [
            {
              "text": "下雨了。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_58c2fb7e17bd4d059853975d53540daa",
          "zh": "太冷了！",
          "pinyin": "Tài lěng le!",
          "translationEn": "It is too cold!",
          "analyses": [
            {
              "textEn": "太冷了 presents the experienced condition directly, with no explicit subject-predicate division."
            }
          ],
          "parts": [
            {
              "text": "太冷了！",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_516cbfcecf1e41348048f4929d6e3627",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-046"
      ],
      "titleEn": "Declarative sentences",
      "targetFormZh": "陈述句",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express information, description, or judgment as a statement rather than a question or command.",
      "patterns": [],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "陈述句"
          ],
          "textEn": "A declarative normally presents its content for the listener to accept as information."
        }
      ],
      "watchOutEn": "Declarative describes the sentence's communicative function; it does not require one particular predicate type.",
      "examples": [
        {
          "id": "gexample_68c2285ec63e444db3a8d3f496f9cc1a",
          "zh": "我是大学生。",
          "pinyin": "Wǒ shì dàxuéshēng.",
          "translationEn": "I am a university student.",
          "analyses": [
            {
              "textEn": "The sentence states the speaker's status and does not request an answer or action."
            }
          ],
          "parts": [
            {
              "text": "我是大学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_44393e8eed4746f7966f3d7532061e7d",
          "zh": "今天很冷。",
          "pinyin": "Jīntiān hěn lěng.",
          "translationEn": "It is cold today.",
          "analyses": [
            {
              "textEn": "The sentence presents today's temperature as information in declarative form."
            }
          ],
          "parts": [
            {
              "text": "今天很冷。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_09d85cc1ba6e4814b12be153e06f304c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-047"
      ],
      "titleEn": "Yes-no questions with 吗",
      "targetFormZh": "Statement + 吗？",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a neutral question whose answer can confirm or deny the whole proposition.",
      "patterns": [
        {
          "labelEn": "Neutral yes-no question",
          "appliesToZh": [
            "是非问句"
          ],
          "pattern": "Statement + 吗？",
          "formationEn": "Add 吗 to the end of statement-order wording.",
          "usageEn": "Invites a yes/no or confirm/deny response."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "是非问句"
          ],
          "textEn": "No subject-verb inversion occurs."
        }
      ],
      "watchOutEn": "Do not combine 吗 with an affirmative-negative form: *你是不是老师吗？ Correct it to 你是老师吗？ or 你是不是老师？",
      "examples": [
        {
          "id": "gexample_99efca21b3c1459cb6cfcddcf8e23881",
          "zh": "你是老师吗？",
          "pinyin": "Nǐ shì lǎoshī ma?",
          "translationEn": "Are you a teacher?",
          "analyses": [
            {
              "textEn": "吗 follows the complete proposition 你是老师 and asks whether it is true."
            }
          ],
          "parts": [
            {
              "text": "你是老师",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吗",
              "emphasized": true,
              "role": "question_marker"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_0579e287a70d4f0f8744256be8b599dd",
          "zh": "他今天来吗？",
          "pinyin": "Tā jīntiān lái ma?",
          "translationEn": "Is he coming today?",
          "analyses": [
            {
              "textEn": "吗 turns the statement-order event 他今天来 into a neutral yes-no question."
            }
          ],
          "parts": [
            {
              "text": "他今天来",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吗",
              "emphasized": true,
              "role": "question_marker"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_b38086815f974923ae73489f218f38ba",
          "zh": "你会说汉语吗？",
          "pinyin": "Nǐ huì shuō Hànyǔ ma?",
          "translationEn": "Can you speak Chinese?",
          "analyses": [
            {
              "textEn": "吗 follows the complete statement-order proposition 你会说汉语 and asks whether it is true."
            }
          ],
          "parts": [
            {
              "text": "你会说汉语",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "吗",
              "emphasized": true,
              "role": "question_marker"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_c64087e117dd44169bd7781d5af92a73",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-048"
      ],
      "titleEn": "Specific-information questions",
      "targetFormZh": "Question word in the missing-information position",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a question that asks for a specific person, thing, place, quantity, or manner.",
      "patterns": [
        {
          "labelEn": "In-place question word",
          "appliesToZh": [
            "特指问句"
          ],
          "pattern": "Clause with 谁/什么/哪儿/多少/怎么...",
          "formationEn": "Put the question word in the answer's normal grammatical position.",
          "usageEn": "Requests a specific missing constituent."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "特指问句"
          ],
          "textEn": "A specific-information question normally does not take final 吗."
        }
      ],
      "watchOutEn": "Do not move the question word to sentence-initial position unless that is also where the answer belongs.",
      "examples": [
        {
          "id": "gexample_286bde47fbf7449eb940795906451504",
          "zh": "谁是老师？",
          "pinyin": "Shéi shì lǎoshī?",
          "translationEn": "Who is the teacher?",
          "analyses": [
            {
              "textEn": "谁 fills the subject position and asks for the unknown person's identity."
            }
          ],
          "parts": [
            {
              "text": "谁",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "是老师？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_4ee9b9c40c62476dbed636bb5a7e0a63",
          "zh": "你想吃什么？",
          "pinyin": "Nǐ xiǎng chī shénme?",
          "translationEn": "What would you like to eat?",
          "analyses": [
            {
              "textEn": "什么 remains in the object position after 吃 and asks for the unknown food."
            }
          ],
          "parts": [
            {
              "text": "你想吃",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "什么",
              "emphasized": true,
              "role": "question_word"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_9cce8dd18eab4193b8fd140c593e243a",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-049"
      ],
      "titleEn": "Affirmative-negative questions",
      "targetFormZh": "A-not-A / Verb-not-Verb",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a direct choice between an affirmative and negative version of the same predicate.",
      "patterns": [
        {
          "labelEn": "A-not-A question",
          "appliesToZh": [
            "正反问句"
          ],
          "pattern": "Subject + A-not-A predicate (好不好 / 会不会 / 去不去 / 是不是 / 有没有)？",
          "formationEn": "Use an affirmative-negative pair such as 好不好, 会不会, 去不去, 是不是, or 有没有; do not add 吗.",
          "usageEn": "Asks the listener to choose between the positive and negative alternatives."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "正反问句"
          ],
          "textEn": "The answer can repeat the positive predicate or give its negative form."
        }
      ],
      "watchOutEn": "The affirmative-negative contrast already marks the question: say 你去不去？, not *你去不去吗？",
      "examples": [
        {
          "id": "gexample_b241088c3d7843699cdbf0ddff4c4fe5",
          "zh": "你是不是学生？",
          "pinyin": "Nǐ shì bu shì xuéshēng?",
          "translationEn": "Are you a student or not?",
          "analyses": [
            {
              "textEn": "是不是 presents the affirmative 是 and negative 不是 as the two choices."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是不是",
              "emphasized": true,
              "role": "affirmative_negative_predicate"
            },
            {
              "text": "学生？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_ed434a32f8ce4716a86ad5fd447970a7",
          "zh": "你去不去学校？",
          "pinyin": "Nǐ qù bu qù xuéxiào?",
          "translationEn": "Are you going to school or not?",
          "analyses": [
            {
              "textEn": "去不去 repeats 去 around 不 and asks the listener to choose between going and not going."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "去不去",
              "emphasized": true,
              "role": "affirmative_negative_predicate"
            },
            {
              "text": "学校？",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_32222df882f1471caf34b6f303edcda7",
          "zh": "这本书好不好？",
          "pinyin": "Zhè běn shū hǎo bu hǎo?",
          "translationEn": "Is this book good or not?",
          "analyses": [
            {
              "textEn": "好不好 places the positive and negative adjective choices together and needs no final 吗."
            }
          ],
          "parts": [
            {
              "text": "这本书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "好不好",
              "emphasized": true,
              "role": "affirmative_negative_predicate"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_53b9d25d39a241d0a380f9f6971ed5b3",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-050"
      ],
      "titleEn": "Imperative sentences",
      "targetFormZh": "祈使句",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a request, instruction, invitation, or prohibition directed at the listener.",
      "patterns": [],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "祈使句"
          ],
          "textEn": "The understood subject is often the person being addressed and need not be spoken."
        }
      ],
      "watchOutEn": "Pragmatic force matters: 请 makes a request polite, while a bare command can sound direct and 不要 prohibits.",
      "examples": [
        {
          "id": "gexample_799dd92687fe42f492352b4e8b2f2536",
          "zh": "请坐。",
          "pinyin": "Qǐng zuò.",
          "translationEn": "Please sit down.",
          "analyses": [
            {
              "textEn": "请 introduces the requested action 坐, with the listener understood as its subject."
            }
          ],
          "parts": [
            {
              "text": "请坐。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_43a48ad3d67d4d5d8dfe89df62e2cbc9",
          "zh": "不要说话。",
          "pinyin": "Búyào shuōhuà.",
          "translationEn": "Do not talk.",
          "analyses": [
            {
              "textEn": "不要 turns 说话 into a prohibition directed at the listener."
            }
          ],
          "parts": [
            {
              "text": "不要说话。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_9529a9ee5dd346bcb03610816cefc5c7",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-051"
      ],
      "titleEn": "Exclamatory sentences",
      "targetFormZh": "感叹句",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a strong immediate reaction such as admiration, surprise, pleasure, or discomfort.",
      "patterns": [],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "感叹句"
          ],
          "textEn": "Degree words and intonation commonly carry the speaker's evaluation."
        }
      ],
      "watchOutEn": "An exclamation adds expressive force; punctuation alone does not explain its grammar, so attend to markers such as 太...了 and 真.",
      "examples": [
        {
          "id": "gexample_c1befca731734d688c12f10d7b961de7",
          "zh": "这件衣服太漂亮了！",
          "pinyin": "Zhè jiàn yīfu tài piàoliang le!",
          "translationEn": "This item of clothing is so beautiful!",
          "analyses": [
            {
              "textEn": "太漂亮了 presents the speaker's strong admiration rather than a neutral description."
            }
          ],
          "parts": [
            {
              "text": "这件衣服太漂亮了！",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_4d3da4f5d8d1425189d7a4a461f3523f",
          "zh": "这个苹果真好吃！",
          "pinyin": "Zhège píngguǒ zhēn hǎochī!",
          "translationEn": "This apple is really delicious!",
          "analyses": [
            {
              "textEn": "真 intensifies 好吃 and gives the sentence an enthusiastic evaluative force."
            }
          ],
          "parts": [
            {
              "text": "这个苹果真好吃！",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_7e7ea63f64d44d4882dfecb1f9a1b809",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-052"
      ],
      "titleEn": "Equivalence and class membership with 是",
      "targetFormZh": "Subject + 是 + Noun phrase",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express that one referent is identified with another description or belongs to a named class.",
      "patterns": [
        {
          "labelEn": "Copular identification",
          "appliesToZh": [
            "是"
          ],
          "pattern": "Subject + 是 + Noun phrase",
          "formationEn": "Place 是 between the subject and identifying noun phrase.",
          "usageEn": "Identifies the subject or assigns it to a class."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "是"
          ],
          "textEn": "Negate this pattern with 不是."
        }
      ],
      "watchOutEn": "Use 是 between noun-like expressions. For a neutral adjective predicate, say 她很高兴, not *她是很高兴.",
      "examples": [
        {
          "id": "gexample_0143ebcbad7840b89c4fcce2633c3be0",
          "zh": "他是老师。",
          "pinyin": "Tā shì lǎoshī.",
          "translationEn": "He is a teacher.",
          "analyses": [
            {
              "textEn": "是 links 他 to the class label 老师."
            }
          ],
          "parts": [
            {
              "text": "他",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是",
              "emphasized": true,
              "role": "copula"
            },
            {
              "text": "老师。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_9ed514f9c39f4f1d828bc509b33b993a",
          "zh": "这是我的书。",
          "pinyin": "Zhè shì wǒ de shū.",
          "translationEn": "This is my book.",
          "analyses": [
            {
              "textEn": "是 identifies the referent of 这 as 我的书."
            }
          ],
          "parts": [
            {
              "text": "这",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是",
              "emphasized": true,
              "role": "copula"
            },
            {
              "text": "我的书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_4cddbc688b464912af2aea7f485a6dba",
          "zh": "她不是老师，她是学生。",
          "pinyin": "Tā bú shì lǎoshī, tā shì xuéshēng.",
          "translationEn": "She is not a teacher; she is a student.",
          "analyses": [
            {
              "textEn": "不是 rejects the first class label, and the second 是 supplies the corrected class membership."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "不是",
              "emphasized": true,
              "role": "negative_copula"
            },
            {
              "text": "老师，她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是",
              "emphasized": true,
              "role": "copula"
            },
            {
              "text": "学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_cd34aec214fe4a9cabbf2f3af75c073c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-053"
      ],
      "titleEn": "Possession with 有",
      "targetFormZh": "Possessor + 有 + Possessed item",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express that a person, group, or other possessor has something.",
      "patterns": [
        {
          "labelEn": "Possession",
          "appliesToZh": [
            "有"
          ],
          "pattern": "Possessor + 有 + Possessed item",
          "formationEn": "Place 有 after the possessor and before what is possessed.",
          "usageEn": "States a possession or personal relation."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "有"
          ],
          "textEn": "Use 没有 before the possessed item for the negative form."
        }
      ],
      "watchOutEn": "Negate possession with 没有, not 不有.",
      "examples": [
        {
          "id": "gexample_2c7c157583144534b2a753b969694d1b",
          "zh": "我有两本书。",
          "pinyin": "Wǒ yǒu liǎng běn shū.",
          "translationEn": "I have two books.",
          "analyses": [
            {
              "textEn": "有 links the possessor 我 to the possessed quantity 两本书."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有",
              "emphasized": true,
              "role": "possession_verb"
            },
            {
              "text": "两本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_775740aa065747ff97ac2c7fa997e4d8",
          "zh": "她没有电脑。",
          "pinyin": "Tā méiyǒu diànnǎo.",
          "translationEn": "She does not have a computer.",
          "analyses": [
            {
              "textEn": "没有 is the negative possession form and denies a computer in her possession."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "没有",
              "emphasized": true,
              "role": "negative_possession"
            },
            {
              "text": "电脑。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_a969cfb59bc94ffe9e4cfe7d987bed9c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-054"
      ],
      "titleEn": "Identifying what occupies a place with 是",
      "targetFormZh": "Place expression + 是 + Noun",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Identify what occupies a known location by putting the location before 是 and the entity after it.",
      "patterns": [
        {
          "labelEn": "Location identification",
          "appliesToZh": [
            "处所 + 是 + 名词"
          ],
          "pattern": "Place expression + 是 + Noun",
          "formationEn": "Put the known location before 是 and the identifying noun after it.",
          "usageEn": "Answers what a particular location is or what occupies it."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "处所 + 是 + 名词"
          ],
          "textEn": "This pattern identifies the entity at a known place; the following 有 pattern instead presents an existing quantity."
        }
      ],
      "watchOutEn": "Use this location-first 是 pattern to identify what is there; use place + 有 to introduce an indefinite quantity there.",
      "examples": [
        {
          "id": "gexample_184351f1cde94cac9e312a5179a87dee",
          "zh": "学校前边是书店。",
          "pinyin": "Xuéxiào qiánbian shì shūdiàn.",
          "translationEn": "In front of the school is a bookstore.",
          "analyses": [
            {
              "textEn": "学校前边 is the initial location, and 是 identifies 书店 as what occupies it."
            }
          ],
          "parts": [
            {
              "text": "学校前边",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是",
              "emphasized": true,
              "role": "copula"
            },
            {
              "text": "书店。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_fa9ce126be704acf950e07f354c728fe",
          "zh": "医院后边是饭店。",
          "pinyin": "Yīyuàn hòubian shì fàndiàn.",
          "translationEn": "Behind the hospital is a restaurant.",
          "analyses": [
            {
              "textEn": "医院后边 establishes the location before 是, and 饭店 names what is there."
            }
          ],
          "parts": [
            {
              "text": "医院后边",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "是",
              "emphasized": true,
              "role": "copula"
            },
            {
              "text": "饭店。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_2591dabcc1884f9abb97f4a2f22ff0b6",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-055"
      ],
      "titleEn": "Presenting what exists at a place with 有",
      "targetFormZh": "Place + 有 + Numeral-measure phrase + Noun",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express that a counted person, animal, or thing exists at a location by putting the place first.",
      "patterns": [
        {
          "labelEn": "Existence at a place",
          "appliesToZh": [
            "处所 + 有 + 数量短语 + 名词"
          ],
          "pattern": "Place + 有 + Numeral + Classifier + Noun",
          "formationEn": "Put the place before 有 and introduce the new entity after it.",
          "usageEn": "Presents an entity as existing at the stated location."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "处所 + 有 + 数量短语 + 名词"
          ],
          "textEn": "The entity after 有 is typically new information and often has an indefinite quantity."
        }
      ],
      "watchOutEn": "The location is not the possessor here; the sentence presents what exists there.",
      "examples": [
        {
          "id": "gexample_e58f26accab446efb0d6391a481b65c8",
          "zh": "桌子上有一本书。",
          "pinyin": "Zhuōzi shàng yǒu yì běn shū.",
          "translationEn": "There is a book on the table.",
          "analyses": [
            {
              "textEn": "桌子上 is the initial place, and 有 introduces the new entity 一本书."
            }
          ],
          "parts": [
            {
              "text": "桌子上",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有",
              "emphasized": true,
              "role": "existential_verb"
            },
            {
              "text": "一本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_3e4af6239e954b9181365b360f9ace40",
          "zh": "房间里有两只猫。",
          "pinyin": "Fángjiān lǐ yǒu liǎng zhī māo.",
          "translationEn": "There are two cats in the room.",
          "analyses": [
            {
              "textEn": "房间里 sets the location, while 有 presents 两只猫 as existing there."
            }
          ],
          "parts": [
            {
              "text": "房间里",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有",
              "emphasized": true,
              "role": "existential_verb"
            },
            {
              "text": "两只猫。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_f79b11cda8f148b1ba63310ddc3cc7e0",
          "zh": "桌子上有几本书？",
          "pinyin": "Zhuōzi shàng yǒu jǐ běn shū?",
          "translationEn": "How many books are on the table?",
          "analyses": [
            {
              "textEn": "桌子上 establishes the place, and 有 introduces the interrogative quantity 几本书."
            }
          ],
          "parts": [
            {
              "text": "桌子上",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "有",
              "emphasized": true,
              "role": "existential_verb"
            },
            {
              "text": "几本书？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_da3d25b747b946389f9953cd5238b2f2",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-056"
      ],
      "titleEn": "Serial actions leading to a purpose",
      "targetFormZh": "Subject + Verb phrase 1 + Verb phrase 2 (purpose)",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express an earlier movement or action followed by the action that gives it its purpose.",
      "patterns": [
        {
          "labelEn": "Action plus purpose",
          "appliesToZh": [
            "动词短语1 + 动词短语2"
          ],
          "pattern": "Subject + V1 (+ Place) + V2 (+ Object)",
          "formationEn": "Place the movement or enabling action first and the purpose action second.",
          "usageEn": "Shows that the subject performs V1 in order to carry out V2."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "动词短语1 + 动词短语2"
          ],
          "textEn": "Do not add a conjunction between the two verb phrases in this basic construction."
        }
      ],
      "watchOutEn": "The two verb phrases share one subject, and the later action explains why the earlier one is performed.",
      "examples": [
        {
          "id": "gexample_62f883302c2a463badbfc095904e2c3c",
          "zh": "我去商店买水果。",
          "pinyin": "Wǒ qù shāngdiàn mǎi shuǐguǒ.",
          "translationEn": "I'm going to the store to buy fruit.",
          "analyses": [
            {
              "textEn": "去商店 happens first, and 买水果 states the purpose of going."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "去商店买水果",
              "emphasized": true,
              "role": "serial_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_c69fa4524a8f4b5b9268b602bfa52f40",
          "zh": "她去学校学习汉语。",
          "pinyin": "Tā qù xuéxiào xuéxí Hànyǔ.",
          "translationEn": "She goes to school to study Chinese.",
          "analyses": [
            {
              "textEn": "去学校 is followed directly by 学习汉语, which gives the purpose of going."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "去学校学习汉语",
              "emphasized": true,
              "role": "serial_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_63b7cbccafa74b23bbd5aa16e6d062da",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-057"
      ],
      "titleEn": "Serial actions expressing manner",
      "targetFormZh": "Subject + Verb phrase 1 (manner) + Verb phrase 2",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express how a later action is carried out by placing the manner action before it.",
      "patterns": [
        {
          "labelEn": "Manner plus action",
          "appliesToZh": [
            "动词短语1 + 动词短语2"
          ],
          "pattern": "Subject + Manner V1 + Main V2",
          "formationEn": "Put the means or manner action immediately before the main action.",
          "usageEn": "Explains how the subject performs V2."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "动词短语1 + 动词短语2"
          ],
          "textEn": "Transport expressions such as 坐出租车 and 开车 commonly supply the manner of 去 or 来."
        }
      ],
      "watchOutEn": "The first verb phrase supplies the manner or means of the second; it is not a separate unrelated event.",
      "examples": [
        {
          "id": "gexample_fc676d847f9a4c9cbf6e4adc1306afff",
          "zh": "我坐出租车去学校。",
          "pinyin": "Wǒ zuò chūzūchē qù xuéxiào.",
          "translationEn": "I go to school by taxi.",
          "analyses": [
            {
              "textEn": "坐出租车 precedes 去学校 and states the means by which the going happens."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "坐出租车去学校",
              "emphasized": true,
              "role": "serial_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_8a804581cbcc408abf070c1f48fb3b5c",
          "zh": "他开车去医院。",
          "pinyin": "Tā kāichē qù yīyuàn.",
          "translationEn": "He drives to the hospital.",
          "analyses": [
            {
              "textEn": "开车 is the manner action and directly precedes the destination action 去医院."
            }
          ],
          "parts": [
            {
              "text": "他",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "开车去医院",
              "emphasized": true,
              "role": "serial_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_48a062355f864c48b758a0b01ef35199",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-058"
      ],
      "titleEn": "Double-object sentences",
      "targetFormZh": "Subject + Verb + Indirect object + Direct object",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a transfer in which one verb relates both a recipient and a transferred thing.",
      "patterns": [
        {
          "labelEn": "Recipient and thing",
          "appliesToZh": [
            "主语 + 动词 + 宾语1 + 宾语2"
          ],
          "pattern": "Subject + 给 + Recipient + Thing",
          "formationEn": "Place the recipient immediately after 给 and the transferred item after the recipient.",
          "usageEn": "Presents a giving event with two objects."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "主语 + 动词 + 宾语1 + 宾语2"
          ],
          "textEn": "Both objects belong to the same verb; no second 给 is needed in this basic pattern."
        }
      ],
      "watchOutEn": "The recipient normally comes before the transferred item: 给我一本书, not 给一本书我.",
      "examples": [
        {
          "id": "gexample_311f9840049a47a6a65119f979c6be9d",
          "zh": "我给你一本书。",
          "pinyin": "Wǒ gěi nǐ yì běn shū.",
          "translationEn": "I'll give you a book.",
          "analyses": [
            {
              "textEn": "给 takes 你 as the recipient object and 一本书 as the thing object, in that order."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "给你一本书",
              "emphasized": true,
              "role": "double_object_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_225abb81b9024a81a30c263e57170649",
          "zh": "他明天给我一个苹果。",
          "pinyin": "Tā míngtiān gěi wǒ yí ge píngguǒ.",
          "translationEn": "He'll give me an apple tomorrow.",
          "analyses": [
            {
              "textEn": "我 is the first, recipient-like object of 给, followed by the transferred item 一个苹果."
            }
          ],
          "parts": [
            {
              "text": "他明天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "给我一个苹果",
              "emphasized": true,
              "role": "double_object_sequence"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_73abda480e704260a24bf9035bcb482c",
          "zh": "老师要给你什么？",
          "pinyin": "Lǎoshī yào gěi nǐ shénme?",
          "translationEn": "What does the teacher want to give you?",
          "analyses": [
            {
              "textEn": "给 takes 你 as its recipient object and 什么 as the requested thing object, in that order."
            }
          ],
          "parts": [
            {
              "text": "老师要",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "给你什么",
              "emphasized": true,
              "role": "double_object_sequence"
            },
            {
              "text": "？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_2d8af7f2d3cf4844a8b8092c733e4ae6",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-059"
      ],
      "titleEn": "Clause relationships without a connector",
      "targetFormZh": "Clause 1, Clause 2 (no linking word)",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express a simple relationship between two clauses through order and context without an overt conjunction.",
      "patterns": [],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "Clause 1, Clause 2 (no linking word)"
          ],
          "textEn": "A natural time, cause, or event sequence lets the listener infer how the clauses connect."
        }
      ],
      "watchOutEn": "The relationship must be clear from meaning and order; omitting a connector does not make unrelated clauses coherent.",
      "examples": [
        {
          "id": "gexample_fe5650a376b64940aabe4f3505929c30",
          "zh": "今天下雨，我不去学校。",
          "pinyin": "Jīntiān xiàyǔ, wǒ bú qù xuéxiào.",
          "translationEn": "It is raining today, so I am not going to school.",
          "analyses": [
            {
              "textEn": "The rain clause precedes the decision clause, and their causal relation is understood without a conjunction."
            }
          ],
          "parts": [
            {
              "text": "今天下雨，我不去学校。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_a514f22d3545446aa7e80fb77a55c303",
          "zh": "他生病了，我去医院看他。",
          "pinyin": "Tā shēngbìng le, wǒ qù yīyuàn kàn tā.",
          "translationEn": "He is ill, so I am going to the hospital to see him.",
          "analyses": [
            {
              "textEn": "The illness and response form two related clauses; context supplies the causal link without an overt connector."
            }
          ],
          "parts": [
            {
              "text": "他生病了，我去医院看他。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_db21663d6ac94570a7bf0deebcd4c748",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-060"
      ],
      "titleEn": "Parallel facts with 也",
      "targetFormZh": "Clause 1, Subject + 也 + Predicate",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express that a second participant or situation shares the fact stated in the first clause.",
      "patterns": [
        {
          "labelEn": "Parallel addition",
          "appliesToZh": [
            "……，也……"
          ],
          "pattern": "Clause 1, Subject 2 + 也 + Predicate 2",
          "formationEn": "State the first fact, then place 也 before the matching second predicate.",
          "usageEn": "Marks the second fact as likewise true."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "……，也……"
          ],
          "textEn": "The repeated or understood comparison creates the parallel reading."
        }
      ],
      "watchOutEn": "Place 也 after the second clause's subject and before its predicate.",
      "examples": [
        {
          "id": "gexample_7ccad2609fb44ef18c7a9bf45a55b5d9",
          "zh": "他喜欢看书，我也喜欢看书。",
          "pinyin": "Tā xǐhuan kàn shū, wǒ yě xǐhuan kàn shū.",
          "translationEn": "He likes reading, and I like reading too.",
          "analyses": [
            {
              "textEn": "也 precedes the second 喜欢看书 and marks it as parallel to the first clause."
            }
          ],
          "parts": [
            {
              "text": "他喜欢看书，我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "也",
              "emphasized": true,
              "role": "connector"
            },
            {
              "text": "喜欢看书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_6128395fc205482fbc122f7ff2a4c1a8",
          "zh": "妈妈是老师，爸爸也是老师。",
          "pinyin": "Māma shì lǎoshī, bàba yě shì lǎoshī.",
          "translationEn": "Mom is a teacher, and Dad is a teacher too.",
          "analyses": [
            {
              "textEn": "也 in the second clause makes 爸爸 share the teacher status already stated for 妈妈."
            }
          ],
          "parts": [
            {
              "text": "妈妈是老师，爸爸",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "也",
              "emphasized": true,
              "role": "connector"
            },
            {
              "text": "是老师。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_2232c0c8bc1142afa9218cd5d1ed8c8b",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-061"
      ],
      "titleEn": "Adding another fact with 还",
      "targetFormZh": "Clause 1, Subject + 还 + Predicate",
      "categoryKey": "category-5",
      "categoryEn": "Sentence types",
      "categoryZh": "句子的类型",
      "purposeEn": "Express an additional action or fact after an initial one by introducing it with additive 还.",
      "patterns": [
        {
          "labelEn": "Additional fact",
          "appliesToZh": [
            "……，还……"
          ],
          "pattern": "Clause 1, Subject + 还 + Predicate",
          "formationEn": "State one fact, then put 还 before the added predicate.",
          "usageEn": "Adds another action, property, or item to the first information."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "……，还……"
          ],
          "textEn": "还 often feels like 'and in addition,' so the second clause expands the information rather than merely matching it."
        }
      ],
      "watchOutEn": "This 还1 means 'also/in addition'; it does not express the later temporal or comparative senses indexed elsewhere in the syllabus.",
      "examples": [
        {
          "id": "gexample_eae0a18426e64bddbca17b98a4aa55ff",
          "zh": "我买了书，还买了水果。",
          "pinyin": "Wǒ mǎile shū, hái mǎile shuǐguǒ.",
          "translationEn": "I bought books and also bought fruit.",
          "analyses": [
            {
              "textEn": "还 introduces 买了水果 as an additional purchase after the first clause."
            }
          ],
          "parts": [
            {
              "text": "我买了书，",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "还",
              "emphasized": true,
              "role": "connector"
            },
            {
              "text": "买了水果。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_35652635834e4dc2bedb3b6c5e7bc9f5",
          "zh": "她会说汉语，还会写汉字。",
          "pinyin": "Tā huì shuō Hànyǔ, hái huì xiě Hànzì.",
          "translationEn": "She can speak Chinese and can also write Chinese characters.",
          "analyses": [
            {
              "textEn": "还 adds 会写汉字 to the ability 会说汉语 already stated."
            }
          ],
          "parts": [
            {
              "text": "她会说汉语，",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "还",
              "emphasized": true,
              "role": "connector"
            },
            {
              "text": "会写汉字。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_1c532271cd2640b49271c5a329873b24",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-062"
      ],
      "titleEn": "Completed-event aspect",
      "targetFormZh": "Verb + 了1 (+ Object)",
      "categoryKey": "category-6",
      "categoryEn": "Aspects of actions",
      "categoryZh": "动作的态",
      "purposeEn": "Express a bounded event as realized or complete by using perfective 了 immediately after its verb.",
      "patterns": [
        {
          "labelEn": "Bounded event",
          "appliesToZh": [
            "了"
          ],
          "pattern": "Verb + 了 (+ Object)",
          "formationEn": "Attach 了 to the event verb in the basic HSK 1 pattern.",
          "usageEn": "Views the action as a realized whole."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "了"
          ],
          "textEn": "Use 没 without perfective 了 to deny that the event occurred."
        }
      ],
      "watchOutEn": "Perfective 了 gives an event a bounded viewpoint; it is not a general past-tense ending.",
      "examples": [
        {
          "id": "gexample_4aff2d447c4a44d79d74852ae1e1567b",
          "zh": "我看了电影。",
          "pinyin": "Wǒ kànle diànyǐng.",
          "translationEn": "I watched a movie.",
          "analyses": [
            {
              "textEn": "了 follows 看 and presents the movie-watching event as a bounded whole."
            }
          ],
          "parts": [
            {
              "text": "我看",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "aspect_particle"
            },
            {
              "text": "电影。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_549d40e3ad144f8689c35ea53a42f99d",
          "zh": "他买了电脑。",
          "pinyin": "Tā mǎile diànnǎo.",
          "translationEn": "He bought a computer.",
          "analyses": [
            {
              "textEn": "了 after 买 marks the computer purchase as realized and complete."
            }
          ],
          "parts": [
            {
              "text": "他买",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "aspect_particle"
            },
            {
              "text": "电脑。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_e905b001675443aca8517dd361e94872",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-063"
      ],
      "titleEn": "Change-of-state aspect",
      "targetFormZh": "New situation + 了2",
      "categoryKey": "category-6",
      "categoryEn": "Aspects of actions",
      "categoryZh": "动作的态",
      "purposeEn": "Express that a new state now holds or that the current situation has changed by placing 了 at sentence end.",
      "patterns": [
        {
          "labelEn": "New situation",
          "appliesToZh": [
            "了"
          ],
          "pattern": "Changed situation + 了",
          "formationEn": "Place 了 at the end of the complete clause.",
          "usageEn": "Signals that the stated condition is now relevant and differs from before."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "了"
          ],
          "textEn": "Context supplies the earlier state against which the change is understood."
        }
      ],
      "watchOutEn": "Sentence-final 了2 scopes over the new situation; do not explain it as a past-tense marker or merge it with verb-final perfective 了1.",
      "examples": [
        {
          "id": "gexample_672bb4b9312b442cbff8aca91c096bb2",
          "zh": "天气冷了。",
          "pinyin": "Tiānqì lěng le.",
          "translationEn": "The weather has turned cold.",
          "analyses": [
            {
              "textEn": "Sentence-final 了 presents cold weather as the new state now in effect."
            }
          ],
          "parts": [
            {
              "text": "天气冷",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "change_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_c7ddd534028a4652b35739bd8d3bc83b",
          "zh": "他是大学生了。",
          "pinyin": "Tā shì dàxuéshēng le.",
          "translationEn": "He is a university student now.",
          "analyses": [
            {
              "textEn": "Final 了 marks university-student status as a new situation, not a completed action."
            }
          ],
          "parts": [
            {
              "text": "他是大学生",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "change_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_345a7db8dcf24b67b9fad859556d4aac",
          "zh": "天气不冷了。",
          "pinyin": "Tiānqì bù lěng le.",
          "translationEn": "The weather is no longer cold.",
          "analyses": [
            {
              "textEn": "不冷 is the new state, and final 了 marks the change from the earlier cold weather."
            }
          ],
          "parts": [
            {
              "text": "天气不冷",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "了",
              "emphasized": true,
              "role": "change_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_36fbed7cb60f418fb1fcde9d82fc8d3c",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-064"
      ],
      "titleEn": "Progressive aspect with 在 or 正在",
      "targetFormZh": "Subject + 在/正在 + Verb",
      "categoryKey": "category-6",
      "categoryEn": "Aspects of actions",
      "categoryZh": "动作的态",
      "purposeEn": "Express that an action is in progress, using 在 for the basic ongoing reading or 正在 for stronger focus on the current moment.",
      "patterns": [
        {
          "labelEn": "Basic ongoing action",
          "appliesToZh": [
            "在 + 动词"
          ],
          "pattern": "Subject + 在 + Verb",
          "formationEn": "Place 在 immediately before the action.",
          "usageEn": "Marks the action as underway."
        },
        {
          "labelEn": "Focused ongoing action",
          "appliesToZh": [
            "正在 + 动词"
          ],
          "pattern": "Subject + 正在 + Verb",
          "formationEn": "Place 正在 immediately before the action.",
          "usageEn": "Emphasizes that the action is underway at the reference moment."
        }
      ],
      "notes": [
        {
          "kind": "constraint",
          "appliesToZh": [
            "在 + 动词",
            "正在 + 动词"
          ],
          "textEn": "Progressive aspect is suited to ongoing activities, not every state or identity predicate."
        }
      ],
      "watchOutEn": "Compare 我在看书 ('I am reading') with 我在学校看书 ('I read at school'): progressive 在 is followed by the action, while locative 在 is followed by the place.",
      "examples": [
        {
          "id": "gexample_b559ff3cea5341e4a5511b6791d82bf3",
          "zh": "我在看书。",
          "pinyin": "Wǒ zài kàn shū.",
          "translationEn": "I am reading.",
          "analyses": [
            {
              "textEn": "在 stands directly before 看书 and marks reading as ongoing."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "progressive_marker"
            },
            {
              "text": "看书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_50cb13232e93489a8cf8148ab796cef1",
          "zh": "她正在吃饭。",
          "pinyin": "Tā zhèngzài chīfàn.",
          "translationEn": "She is eating right now.",
          "analyses": [
            {
              "textEn": "正在 directly precedes 吃饭 and focuses on the meal being in progress now."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "正在",
              "emphasized": true,
              "role": "progressive_marker"
            },
            {
              "text": "吃饭。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_f5920fa0a3c042a48c647c76dd37c313",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-065"
      ],
      "titleEn": "Framing an ongoing action with 在/正在 and 呢",
      "targetFormZh": "Subject + 在/正在 + Verb + 呢",
      "categoryKey": "category-6",
      "categoryEn": "Aspects of actions",
      "categoryZh": "动作的态",
      "purposeEn": "Express an action as visibly or contextually underway by combining a preverbal progressive marker with final 呢.",
      "patterns": [
        {
          "labelEn": "Full progressive frame",
          "appliesToZh": [
            "在 + 动词 + 呢",
            "正在 + 动词 + 呢"
          ],
          "pattern": "Subject + 在/正在 + Verb + 呢",
          "formationEn": "Place 在 or 正在 before the verb and 呢 at clause end.",
          "usageEn": "Presents the action as currently in progress, with final pragmatic highlighting."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "在 + 动词 + 呢",
            "正在 + 动词 + 呢"
          ],
          "textEn": "正在 is the more emphatic preverbal choice; both variants can close with neutral-tone 呢."
        }
      ],
      "watchOutEn": "在 or 正在 marks the action before the verb, while 呢 closes the clause and highlights the ongoing situation.",
      "examples": [
        {
          "id": "gexample_833ddd860345404db5bb1d83cd01691d",
          "zh": "我在看书呢。",
          "pinyin": "Wǒ zài kàn shū ne.",
          "translationEn": "I am reading.",
          "analyses": [
            {
              "textEn": "在 marks 看书 as ongoing and final 呢 reinforces the current-situation frame."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "在",
              "emphasized": true,
              "role": "progressive_marker"
            },
            {
              "text": "看书",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "final_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_5b24c462aa044d5f91369d01aa97aaee",
          "zh": "她正在吃饭呢。",
          "pinyin": "Tā zhèngzài chīfàn ne.",
          "translationEn": "She is eating right now.",
          "analyses": [
            {
              "textEn": "正在 focuses the ongoing meal, and 呢 closes the clause as a current situation."
            }
          ],
          "parts": [
            {
              "text": "她",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "正在",
              "emphasized": true,
              "role": "progressive_marker"
            },
            {
              "text": "吃饭",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "final_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_21bd039e25d64151956190fa42876f2f",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-066"
      ],
      "titleEn": "Ongoing situations with final 呢",
      "targetFormZh": "Subject + Verb phrase + 呢",
      "categoryKey": "category-6",
      "categoryEn": "Aspects of actions",
      "categoryZh": "动作的态",
      "purposeEn": "Express that an understood activity is underway by ending the action clause with 呢 even without 在 or 正在.",
      "patterns": [
        {
          "labelEn": "Contextual ongoing action",
          "appliesToZh": [
            "动词短语 + 呢"
          ],
          "pattern": "Subject + Verb phrase + 呢",
          "formationEn": "Place neutral-tone 呢 at the end of the activity clause.",
          "usageEn": "Highlights that the activity is in progress in the current context."
        }
      ],
      "notes": [
        {
          "kind": "pragmatics",
          "appliesToZh": [
            "动词短语 + 呢"
          ],
          "textEn": "This compact form is especially natural when answering what someone is doing or correcting an assumption."
        }
      ],
      "watchOutEn": "Context must support an ongoing reading; final 呢 does not make every predicate progressive.",
      "examples": [
        {
          "id": "gexample_8370f8a046424dbaa24d4a8e802c9c24",
          "zh": "他看电视呢。",
          "pinyin": "Tā kàn diànshì ne.",
          "translationEn": "He is watching television.",
          "analyses": [
            {
              "textEn": "Final 呢 gives 看电视 the contextually ongoing reading without an overt preverbal marker."
            }
          ],
          "parts": [
            {
              "text": "他看电视",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "final_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_986849ae57014c93a46cd716b8d457a9",
          "zh": "妈妈做饭呢。",
          "pinyin": "Māma zuòfàn ne.",
          "translationEn": "Mom is cooking.",
          "analyses": [
            {
              "textEn": "呢 closes 做饭 and highlights cooking as the activity underway now."
            }
          ],
          "parts": [
            {
              "text": "妈妈做饭",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "呢",
              "emphasized": true,
              "role": "final_particle"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_7152d114a79049a4993f58b6c7847994",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-067"
      ],
      "titleEn": "Expressing prices and money amounts",
      "targetFormZh": "Numeral + 元/块",
      "categoryKey": "category-7",
      "categoryEn": "Special expressions",
      "categoryZh": "特殊表达法",
      "purposeEn": "Express a price or money amount in standard 元 or everyday 块.",
      "patterns": [
        {
          "labelEn": "Money amount",
          "appliesToZh": [
            "元",
            "块"
          ],
          "pattern": "Numeral + 元/块",
          "formationEn": "Place the amount directly before the currency unit.",
          "usageEn": "States a price or amount of Chinese currency."
        }
      ],
      "notes": [
        {
          "kind": "usage",
          "appliesToZh": [
            "元",
            "块"
          ],
          "textEn": "A price can serve as a direct quantity predicate after the item being priced."
        }
      ],
      "watchOutEn": "元 is the standard unit name; 块 is common in everyday speech for the same unit in prices.",
      "examples": [
        {
          "id": "gexample_55815d6472fa400dba44bbaae76431ed",
          "zh": "这本书二十元。",
          "pinyin": "Zhè běn shū èrshí yuán.",
          "translationEn": "This book costs twenty yuan.",
          "analyses": [
            {
              "textEn": "二十元 is the standard-form money amount used directly as the book's price."
            }
          ],
          "parts": [
            {
              "text": "这本书二十",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "元",
              "emphasized": true,
              "role": "currency_unit"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_a7baa2c61a23455ea2b74312ccac834f",
          "zh": "这个苹果三块。",
          "pinyin": "Zhège píngguǒ sān kuài.",
          "translationEn": "This apple costs three yuan.",
          "analyses": [
            {
              "textEn": "三块 uses everyday 块 as the yuan unit in the stated price."
            }
          ],
          "parts": [
            {
              "text": "这个苹果三",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "块",
              "emphasized": true,
              "role": "currency_unit"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_2bc3cb79e1e04b6d9cd14141c3854bf6",
          "zh": "这个苹果不是三块，是两块。",
          "pinyin": "Zhège píngguǒ bú shì sān kuài, shì liǎng kuài.",
          "translationEn": "This apple is not three yuan; it is two yuan.",
          "analyses": [
            {
              "textEn": "三块 and 两块 are everyday money amounts; the second clause corrects the first proposed price."
            }
          ],
          "parts": [
            {
              "text": "这个苹果不是三",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "块",
              "emphasized": true,
              "role": "currency_unit"
            },
            {
              "text": "，是两",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "块",
              "emphasized": true,
              "role": "currency_unit"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_945b84d2096b4309acee40e0e2adbc2b",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-068"
      ],
      "titleEn": "Ordinal numbers with 第",
      "targetFormZh": "第 + Numeral",
      "categoryKey": "category-7",
      "categoryEn": "Special expressions",
      "categoryZh": "特殊表达法",
      "purposeEn": "Express first, second, third, and other positions in an ordered series by prefixing 第 to a cardinal number.",
      "patterns": [
        {
          "labelEn": "Ordinal position",
          "appliesToZh": [
            "第 + 数词"
          ],
          "pattern": "第 + Numeral (+ Classifier + Noun)",
          "formationEn": "Attach 第 before the numeral and retain the required classifier before a following noun.",
          "usageEn": "Names position in an ordered sequence."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "第 + 数词"
          ],
          "textEn": "The tone of 一 remains first tone in the ordinal number 第一."
        }
      ],
      "watchOutEn": "第 changes a number into an order label; a classifier still follows when the ordinal modifies a counted noun.",
      "examples": [
        {
          "id": "gexample_9c99b8f9d57a4454b2dea633747d9372",
          "zh": "这是第一本书。",
          "pinyin": "Zhè shì dì-yī běn shū.",
          "translationEn": "This is the first book.",
          "analyses": [
            {
              "textEn": "第 prefixes 一 to form 第一, which precedes the book classifier 本."
            }
          ],
          "parts": [
            {
              "text": "这是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "第一",
              "emphasized": true,
              "role": "ordinal"
            },
            {
              "text": "本书。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_1391458727414af19beea6cfbec1a593",
          "zh": "他是第三个学生。",
          "pinyin": "Tā shì dì-sān ge xuéshēng.",
          "translationEn": "He is the third student.",
          "analyses": [
            {
              "textEn": "第三 gives the student's ordered position and is followed by classifier 个."
            }
          ],
          "parts": [
            {
              "text": "他是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "第三",
              "emphasized": true,
              "role": "ordinal"
            },
            {
              "text": "个学生。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_558b9ebc01934fa89f4eecfe76570426",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-069"
      ],
      "titleEn": "Years, months, dates, and weekdays",
      "targetFormZh": "数词 + 年；数词 + 月；数词 + 日/号；星期 + 数词/日/天",
      "categoryKey": "category-7",
      "categoryEn": "Special expressions",
      "categoryZh": "特殊表达法",
      "purposeEn": "Express calendar years, months, dates, and days of the week in standard Mandarin order.",
      "patterns": [
        {
          "labelEn": "Calendar date",
          "appliesToZh": [
            "数词 + 年",
            "数词 + 月",
            "数词 + 日/号",
            "星期 + 数词/日/天"
          ],
          "pattern": "数词 + 年 + 数词 + 月 + 数词 + 日/号",
          "formationEn": "State units from largest to smallest.",
          "usageEn": "Names a complete or partial calendar date."
        },
        {
          "labelEn": "Weekday",
          "appliesToZh": [
            "星期 + 数词/日/天"
          ],
          "pattern": "星期 + 一/二/三/四/五/六/日/天",
          "formationEn": "Place the weekday label after 星期.",
          "usageEn": "Names a day within the week."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "数词 + 年",
            "数词 + 月",
            "数词 + 日/号",
            "星期 + 数词/日/天"
          ],
          "textEn": "Read the digits of a year individually; read month and day numbers as ordinary cardinal numbers."
        }
      ],
      "watchOutEn": "Calendar order runs from larger unit to smaller unit: year, month, then day. 星期日 and 星期天 both mean Sunday.",
      "examples": [
        {
          "id": "gexample_4bfbed213de44105bf69a4fa9a0500b8",
          "zh": "今天是五月一日。",
          "pinyin": "Jīntiān shì wǔ yuè yī rì.",
          "translationEn": "Today is May 1.",
          "analyses": [
            {
              "textEn": "五月 places the month number before 月 in larger-to-smaller date order."
            },
            {
              "textEn": "一日 follows the month and marks the first day in formal date style."
            }
          ],
          "parts": [
            {
              "text": "今天是",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "五月",
              "emphasized": true,
              "role": "month_expression"
            },
            {
              "text": "一日",
              "emphasized": true,
              "role": "day_expression"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_01e7043b830740c39ed5656f0e61e01b",
          "zh": "明天星期日。",
          "pinyin": "Míngtiān xīngqīrì.",
          "translationEn": "Tomorrow is Sunday.",
          "analyses": [
            {
              "textEn": "星期日 is the conventional weekday expression for Sunday and serves as the predicate of 明天."
            }
          ],
          "parts": [
            {
              "text": "明天",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "星期日",
              "emphasized": true,
              "role": "weekday_expression"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    },
    {
      "id": "glesson_8e74d0cdc0324dcaa7ace1d175619c98",
      "level": 1,
      "primaryPointIds": [
        "hsk26-g1-070"
      ],
      "titleEn": "Clock-time expressions",
      "targetFormZh": "数词 + 点；数词 + 点 + 半；数词 + 点 + 数词 + 分",
      "categoryKey": "category-7",
      "categoryEn": "Special expressions",
      "categoryZh": "特殊表达法",
      "purposeEn": "Express an hour, half hour, or hour-and-minute clock time with 点, 半, and 分.",
      "patterns": [
        {
          "labelEn": "Clock time",
          "appliesToZh": [
            "数词 + 点",
            "数词 + 点 + 半",
            "数词 + 点 + 数词 + 分"
          ],
          "pattern": "数词 + 点 + (半 / 数词 + 分)",
          "formationEn": "State the hour before 点, then add 半 or a minute value when needed.",
          "usageEn": "Locates an event at a time on the clock."
        }
      ],
      "notes": [
        {
          "kind": "formation",
          "appliesToZh": [
            "数词 + 点",
            "数词 + 点 + 半",
            "数词 + 点 + 数词 + 分"
          ],
          "textEn": "When the minute value is understood in ordinary speech, 分 may be omitted, but the full HSK 1 formula keeps it explicit."
        }
      ],
      "watchOutEn": "点 marks the hour on the clock; 小时 measures duration and cannot replace 点 in a clock reading.",
      "examples": [
        {
          "id": "gexample_b221023dea524363882ad43c7bf573cb",
          "zh": "现在三点半。",
          "pinyin": "Xiànzài sān diǎn bàn.",
          "translationEn": "It is half past three now.",
          "analyses": [
            {
              "textEn": "三点 gives the hour and 半 adds half an hour to form 3:30."
            }
          ],
          "parts": [
            {
              "text": "现在",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "三点半",
              "emphasized": true,
              "role": "clock_expression"
            },
            {
              "text": "。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_74451532160a4f80a6b2caa9f822b46f",
          "zh": "我八点十分上课。",
          "pinyin": "Wǒ bā diǎn shí fēn shàngkè.",
          "translationEn": "I have class at 8:10.",
          "analyses": [
            {
              "textEn": "八点 states the hour and 十分 supplies the minute value before the action 上课."
            }
          ],
          "parts": [
            {
              "text": "我",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "八点十分",
              "emphasized": true,
              "role": "clock_expression"
            },
            {
              "text": "上课。",
              "emphasized": false,
              "role": ""
            }
          ]
        },
        {
          "id": "gexample_0e9fd21ce45245aa92ac8709cdb142b9",
          "zh": "你几点上课？",
          "pinyin": "Nǐ jǐ diǎn shàngkè?",
          "translationEn": "What time do you have class?",
          "analyses": [
            {
              "textEn": "几点 uses the interrogative numeral 几 before 点 to ask for the unknown clock hour."
            }
          ],
          "parts": [
            {
              "text": "你",
              "emphasized": false,
              "role": ""
            },
            {
              "text": "几点",
              "emphasized": true,
              "role": "clock_expression"
            },
            {
              "text": "上课？",
              "emphasized": false,
              "role": ""
            }
          ]
        }
      ]
    }
  ]
};
  if (!root || typeof root !== "object") return;
  if (payload.schemaVersion !== "2" || payload.syllabusId !== "hsk-2025-11" || payload.level !== 1 || !Array.isArray(payload.officialPointIds) || payload.officialPointIds.length !== 70 || !Array.isArray(payload.categories) || !Array.isArray(payload.lessons)) return;
  var catalogs = root.grammarCatalogByLevel;
  if (!catalogs || typeof catalogs !== "object" || Array.isArray(catalogs)) {
    catalogs = {};
    root.grammarCatalogByLevel = catalogs;
  }
  var current = catalogs[payload.level];
  var currentValid = current && current.schemaVersion === payload.schemaVersion && current.syllabusId === payload.syllabusId && current.level === payload.level && Array.isArray(current.officialPointIds) && current.officialPointIds.length === 70 && Array.isArray(current.categories) && Array.isArray(current.lessons);
  if (currentValid) return;
  if (current) delete catalogs[payload.level];
  catalogs[payload.level] = payload;
})();
