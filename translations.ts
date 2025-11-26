import { Language, TimerMode } from './types';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  de: 'Deutsch',
  ca: 'Català'
};

export const TRANSLATIONS = {
  en: {
    sidebar: {
      timer: 'Timer',
      tasks: 'Tasks',
      methods: 'Methods',
      breathing: 'Breathing',
      language: 'Language',
      footer: 'Code by Catalina • v1.1.0'
    },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Focus',
        [TimerMode.SHORT_BREAK]: 'Short Break',
        [TimerMode.LONG_BREAK]: 'Long Break',
      },
      status: {
        ready: 'Ready',
        focusing: 'Focusing...',
        resting: 'Resting...'
      },
      controls: {
        reset: 'Reset Timer',
        play: 'Start',
        pause: 'Pause',
        sound: 'Ambience',
        zen: 'Zen Mode'
      },
      edit: {
        placeholder: '25',
        label: 'Set Minutes'
      },
      technique: {
        label: 'Technique',
        custom: 'Custom'
      }
    },
    tasks: {
      title: 'Tasks',
      subtitle: 'Harvest your goals.',
      inputPlaceholder: 'What needs to be done?',
      inProgress: 'In Progress',
      completed: 'Ripe & Ready',
      emptyPending: {
        title: 'No pending tasks.',
        subtitle: 'Enjoy the quiet or add a new goal.'
      }
    },
    methods: {
      title: 'Techniques',
      subtitle: 'Discover the science behind the rhythms.',
      whyTitle: 'Why use a timer?',
      whyDesc: 'Parkinson\'s Law states that "work expands to fill the time available for its completion." By setting strict time boundaries, you force your brain to focus, reduce decision fatigue, and create a sense of urgency that boosts productivity while preventing burnout.',
      bestFor: 'Best for:',
      cards: {
        pomodoro: {
          title: 'Pomodoro Technique',
          desc: 'The classic time management method developed by Francesco Cirillo. It uses a timer to break work into intervals, separated by short breaks.',
          bestFor: 'Procrastination, starting new tasks, and maintaining high intensity on boring chores.'
        },
        fiftyTwo: {
          title: '52/17 Flow',
          desc: 'Derived from a study by DeskTime, this ratio was found to be the habit of the top 10% most productive employees. It treats energy like a battery.',
          bestFor: 'Deep work sessions, cognitive tasks, and maximizing long-term energy throughout the day.'
        },
        ultradian: {
          title: 'Ultradian Rhythm',
          desc: 'Based on the human body\'s natural biological cycles (BRAC). Our brains can only maintain intense focus for about 90 minutes before needing a reset.',
          bestFor: 'Complex problem solving, coding, writing, and creative work that requires immersion.'
        }
      }
    },
    breathing: {
      title: 'Breathing',
      subtitle: 'Calm your mind, restore your focus.',
      instructions: {
        inhale: 'Inhale',
        hold: 'Hold',
        exhale: 'Exhale',
        start: 'Click to start'
      },
      cards: {
        box: {
          title: 'Box Breathing',
          desc: 'Used by Navy SEALs to stay calm under pressure. Equal duration for all phases.',
          benefit: 'Instant stress reduction and focus.'
        },
        relax: {
          title: '4-7-8 Relax',
          desc: 'Developed by Dr. Andrew Weil. A natural tranquilizer for the nervous system.',
          benefit: 'Sleep aid and deep anxiety relief.'
        },
        coherence: {
          title: 'Heart Coherence',
          desc: 'Balances your heart rate variability (HRV) by breathing at 6 breaths per minute.',
          benefit: 'Emotional balance and mental clarity.'
        }
      }
    }
  },
  es: {
    sidebar: {
      timer: 'Temporizador',
      tasks: 'Tareas',
      methods: 'Métodos',
      breathing: 'Respiración',
      language: 'Idioma',
      footer: 'Code by Catalina • v1.1.0'
    },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Enfoque',
        [TimerMode.SHORT_BREAK]: 'Descanso Corto',
        [TimerMode.LONG_BREAK]: 'Descanso Largo',
      },
      status: {
        ready: 'Listo',
        focusing: 'Enfocando...',
        resting: 'Descansando...'
      },
      controls: {
        reset: 'Reiniciar',
        play: 'Iniciar',
        pause: 'Pausar',
        sound: 'Ambiente',
        zen: 'Modo Zen'
      },
      edit: {
        placeholder: '25',
        label: 'Minutos'
      },
      technique: {
        label: 'Técnica',
        custom: 'Personalizado'
      }
    },
    tasks: {
      title: 'Tareas',
      subtitle: 'Cosecha tus objetivos.',
      inputPlaceholder: '¿Qué hay que hacer?',
      inProgress: 'En Progreso',
      completed: 'Listas y Maduras',
      emptyPending: {
        title: 'Sin tareas pendientes.',
        subtitle: 'Disfruta la calma o añade una meta.'
      }
    },
    methods: {
      title: 'Técnicas',
      subtitle: 'Descubre la ciencia detrás de los ritmos.',
      whyTitle: '¿Por qué usar un temporizador?',
      whyDesc: 'La Ley de Parkinson dice que "el trabajo se expande hasta llenar el tiempo disponible". Al poner límites de tiempo, fuerzas a tu cerebro a enfocarse, reduces la fatiga de decisión y creas urgencia para evitar el agotamiento.',
      bestFor: 'Ideal para:',
      cards: {
        pomodoro: {
          title: 'Técnica Pomodoro',
          desc: 'El método clásico de Francesco Cirillo. Divide el trabajo en intervalos separados por descansos cortos.',
          bestFor: 'Procrastinación, iniciar nuevas tareas y mantener intensidad en tareas aburridas.'
        },
        fiftyTwo: {
          title: 'Flujo 52/17',
          desc: 'Según DeskTime, es el hábito del 10% de empleados más productivos. Trata la energía como una batería.',
          bestFor: 'Trabajo profundo, tareas cognitivas y maximizar energía durante el día.'
        },
        ultradian: {
          title: 'Ritmo Ultradiano',
          desc: 'Basado en ciclos biológicos naturales (BRAC). El cerebro solo mantiene foco intenso por 90 minutos antes de necesitar un reset.',
          bestFor: 'Resolución de problemas complejos, programación, escritura y trabajo creativo inmersivo.'
        }
      }
    },
    breathing: {
      title: 'Respiración',
      subtitle: 'Calma tu mente, restaura tu enfoque.',
      instructions: {
        inhale: 'Inhala',
        hold: 'Sostén',
        exhale: 'Exhala',
        start: 'Click para iniciar'
      },
      cards: {
        box: {
          title: 'Respiración Cuadrada',
          desc: 'Usada por los Navy SEALs para mantener la calma bajo presión. Duración igual en todas las fases.',
          benefit: 'Reducción instantánea de estrés y foco.'
        },
        relax: {
          title: '4-7-8 Relax',
          desc: 'Desarrollada por el Dr. Andrew Weil. Un tranquilizante natural para el sistema nervioso.',
          benefit: 'Ayuda para dormir y alivio de ansiedad.'
        },
        coherence: {
          title: 'Coherencia Cardíaca',
          desc: 'Equilibra tu variabilidad de frecuencia cardíaca (VFC) respirando a 6 respiraciones por minuto.',
          benefit: 'Balance emocional y claridad mental.'
        }
      }
    }
  },
  pt: {
    sidebar: {
      timer: 'Temporizador',
      tasks: 'Tarefas',
      methods: 'Métodos',
      breathing: 'Respiração',
      language: 'Idioma',
      footer: 'Code by Catalina • v1.1.0'
    },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Foco',
        [TimerMode.SHORT_BREAK]: 'Pausa Curta',
        [TimerMode.LONG_BREAK]: 'Pausa Longa',
      },
      status: {
        ready: 'Pronto',
        focusing: 'Focando...',
        resting: 'Descansando...'
      },
      controls: {
        reset: 'Reiniciar',
        play: 'Iniciar',
        pause: 'Pausar',
        sound: 'Ambiente',
        zen: 'Modo Zen'
      },
      edit: {
        placeholder: '25',
        label: 'Minutos'
      },
      technique: {
        label: 'Técnica',
        custom: 'Personalizado'
      }
    },
    tasks: {
      title: 'Tarefas',
      subtitle: 'Colha seus objetivos.',
      inputPlaceholder: 'O que precisa ser feito?',
      inProgress: 'Em Andamento',
      completed: 'Maduras & Prontas',
      emptyPending: {
        title: 'Sem tarefas pendentes.',
        subtitle: 'Aproveite a calma ou adicione uma meta.'
      }
    },
    methods: {
      title: 'Técnicas',
      subtitle: 'Descubra a ciência por trás dos ritmos.',
      whyTitle: 'Por que usar um temporizador?',
      whyDesc: 'A Lei de Parkinson afirma que "o trabalho se expande para preencher o tempo disponível". Ao definir limites, você força seu cérebro a focar, reduz a fadiga de decisão e cria urgência.',
      bestFor: 'Melhor para:',
      cards: {
        pomodoro: {
          title: 'Técnica Pomodoro',
          desc: 'O método clássico de Francesco Cirillo. Divide o trabalho em intervalos separados por pausas curtas.',
          bestFor: 'Procrastinação, iniciar novas tarefas e manter intensidade.'
        },
        fiftyTwo: {
          title: 'Fluxo 52/17',
          desc: 'Baseado em estudo da DeskTime, é o hábito dos 10% mais produtivos. Trata a energia como uma bateria.',
          bestFor: 'Trabalho profundo, tarefas cognitivas e maximizar energia.'
        },
        ultradian: {
          title: 'Ritmo Ultradiano',
          desc: 'Baseado em ciclos biológicos (BRAC). O cérebro mantém foco intenso por cerca de 90 minutos antes de precisar reiniciar.',
          bestFor: 'Resolução de problemas, programação, escrita e trabalho criativo.'
        }
      }
    },
    breathing: {
      title: 'Respiração',
      subtitle: 'Acalme sua mente, restaure seu foco.',
      instructions: {
        inhale: 'Inspire',
        hold: 'Segure',
        exhale: 'Expire',
        start: 'Clique para iniciar'
      },
      cards: {
        box: {
          title: 'Respiração Quadrada',
          desc: 'Usada pelos Navy SEALs para manter a calma sob pressão. Duração igual para todas as fases.',
          benefit: 'Redução instantânea de estresse e foco.'
        },
        relax: {
          title: '4-7-8 Relax',
          desc: 'Desenvolvida pelo Dr. Andrew Weil. Um tranquilizante natural para o sistema nervoso.',
          benefit: 'Ajuda para dormir e alívio profundo de ansiedade.'
        },
        coherence: {
          title: 'Coerência Cardíaca',
          desc: 'Equilibra sua variabilidade da frequência cardíaca (VFC) respirando a 6 respirações por minuto.',
          benefit: 'Equilíbrio emocional e clareza mental.'
        }
      }
    }
  },
  de: {
    sidebar: {
      timer: 'Timer',
      tasks: 'Aufgaben',
      methods: 'Methoden',
      breathing: 'Atmung',
      language: 'Sprache',
      footer: 'Code by Catalina • v1.1.0'
    },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Fokus',
        [TimerMode.SHORT_BREAK]: 'Kurze Pause',
        [TimerMode.LONG_BREAK]: 'Lange Pause',
      },
      status: {
        ready: 'Bereit',
        focusing: 'Fokussieren...',
        resting: 'Ausruhen...'
      },
      controls: {
        reset: 'Zurücksetzen',
        play: 'Start',
        pause: 'Pause',
        sound: 'Ambiente',
        zen: 'Zen-Modus'
      },
      edit: {
        placeholder: '25',
        label: 'Minuten'
      },
      technique: {
        label: 'Technik',
        custom: 'Benutzerdefiniert'
      }
    },
    tasks: {
      title: 'Aufgaben',
      subtitle: 'Ernten Sie Ihre Ziele.',
      inputPlaceholder: 'Was muss erledigt werden?',
      inProgress: 'In Bearbeitung',
      completed: 'Fertig & Reif',
      emptyPending: {
        title: 'Keine ausstehenden Aufgaben.',
        subtitle: 'Genießen Sie die Ruhe oder fügen Sie ein Ziel hinzu.'
      }
    },
    methods: {
      title: 'Techniken',
      subtitle: 'Entdecken Sie die Wissenschaft der Rhythmen.',
      whyTitle: 'Warum einen Timer verwenden?',
      whyDesc: 'Das Parkinsonsche Gesetz besagt: "Arbeit dehnt sich in dem Maße aus, wie Zeit für ihre Erledigung zur Verfügung steht." Strenge Zeitlimits zwingen das Gehirn zum Fokus und verhindern Burnout.',
      bestFor: 'Ideal für:',
      cards: {
        pomodoro: {
          title: 'Pomodoro-Technik',
          desc: 'Die klassische Methode von Francesco Cirillo. Arbeit wird in Intervalle mit kurzen Pausen unterteilt.',
          bestFor: 'Prokrastination, neue Aufgaben beginnen und hohe Intensität.'
        },
        fiftyTwo: {
          title: '52/17 Flow',
          desc: 'Laut DeskTime die Gewohnheit der produktivsten 10%. Behandelt Energie wie eine Batterie.',
          bestFor: 'Tiefes Arbeiten, kognitive Aufgaben und langfristige Energie.'
        },
        ultradian: {
          title: 'Ultradianer Rhythmus',
          desc: 'Basiert auf biologischen Zyklen (BRAC). Das Gehirn kann nur etwa 90 Minuten lang intensiven Fokus halten.',
          bestFor: 'Komplexe Problemlösung, Programmieren, Schreiben und kreative Arbeit.'
        }
      }
    },
    breathing: {
      title: 'Atmung',
      subtitle: 'Beruhigen Sie Ihren Geist, stellen Sie Ihren Fokus wieder her.',
      instructions: {
        inhale: 'Einatmen',
        hold: 'Halten',
        exhale: 'Ausatmen',
        start: 'Klicken zum Starten'
      },
      cards: {
        box: {
          title: 'Box-Atmung',
          desc: 'Von Navy SEALs verwendet, um unter Druck ruhig zu bleiben. Gleiche Dauer für alle Phasen.',
          benefit: 'Sofortige Stressreduzierung und Fokus.'
        },
        relax: {
          title: '4-7-8 Entspannung',
          desc: 'Entwickelt von Dr. Andrew Weil. Ein natürliches Beruhigungsmittel für das Nervensystem.',
          benefit: 'Einschlafhilfe und tiefe Angstlinderung.'
        },
        coherence: {
          title: 'Herzkoherenz',
          desc: 'Gleicht Ihre Herzfrequenzvariabilität (HRV) durch Atmen mit 6 Atemzügen pro Minute aus.',
          benefit: 'Emotionales Gleichgewicht und geistige Klarheit.'
        }
      }
    }
  },
  ca: {
    sidebar: {
      timer: 'Temporitzador',
      tasks: 'Tasques',
      methods: 'Mètodes',
      breathing: 'Respiració',
      language: 'Idioma',
      footer: 'Code by Catalina • v1.1.0'
    },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Focus',
        [TimerMode.SHORT_BREAK]: 'Descans Curt',
        [TimerMode.LONG_BREAK]: 'Descans Llarg',
      },
      status: {
        ready: 'Llest',
        focusing: 'Enfocant...',
        resting: 'Descansant...'
      },
      controls: {
        reset: 'Reiniciar',
        play: 'Iniciar',
        pause: 'Pausar',
        sound: 'Ambient',
        zen: 'Mode Zen'
      },
      edit: {
        placeholder: '25',
        label: 'Minuts'
      },
      technique: {
        label: 'Tècnica',
        custom: 'Personalitzat'
      }
    },
    tasks: {
      title: 'Tasques',
      subtitle: 'Cull els teus objectius.',
      inputPlaceholder: 'Què cal fer?',
      inProgress: 'En Progrés',
      completed: 'Llestes i Madures',
      emptyPending: {
        title: 'Sense tasques pendents.',
        subtitle: 'Gaudeix de la calma o afegeix una fita.'
      }
    },
    methods: {
      title: 'Tècniques',
      subtitle: 'Descobreix la ciència darrere els ritmes.',
      whyTitle: 'Per què utilitzar un temporitzador?',
      whyDesc: 'La Llei de Parkinson diu que "la feina s\'expandeix fins a omplir el temps disponible". En posar límits, forces el cervell a enfocar-se, redueixes la fatiga de decisió i crees urgència.',
      bestFor: 'Ideal per a:',
      cards: {
        pomodoro: {
          title: 'Tècnica Pomodoro',
          desc: 'El mètode clàssic de Francesco Cirillo. Divideix la feina en intervals separats per descansos curts.',
          bestFor: 'Procrastinació, començar noves tasques i mantenir intensitat.'
        },
        fiftyTwo: {
          title: 'Flux 52/17',
          desc: 'Segons DeskTime, és l\'hàbit del 10% d\'empleats més productius. Tracta l\'energia com una bateria.',
          bestFor: 'Treball profund, tasques cognitives i maximitzar energia.'
        },
        ultradian: {
          title: 'Ritme Ultradià',
          desc: 'Basat en cicles biològics naturals (BRAC). El cervell només manté focus intens durant 90 minuts.',
          bestFor: 'Resolució de problemes complexos, programació, escriptura i treball creatiu.'
        }
      }
    },
    breathing: {
      title: 'Respiració',
      subtitle: 'Calma la teva ment, restaura el teu focus.',
      instructions: {
        inhale: 'Inhala',
        hold: 'Aguanta',
        exhale: 'Exhala',
        start: 'Clica per iniciar'
      },
      cards: {
        box: {
          title: 'Respiració Quadrada',
          desc: 'Utilitzada pels Navy SEALs per mantenir la calma sota pressió. Durada igual en totes les fases.',
          benefit: 'Reducció instantània d\'estrès i focus.'
        },
        relax: {
          title: '4-7-8 Relax',
          desc: 'Desenvolupada pel Dr. Andrew Weil. Un tranquil·litzant natural per al sistema nerviós.',
          benefit: 'Ajuda per dormir i alleujament d\'ansietat.'
        },
        coherence: {
          title: 'Coherència Cardíaca',
          desc: 'Equilibra la teva variabilitat de freqüència cardíaca (VFC) respirant a 6 respiracions per minut.',
          benefit: 'Balanç emocional i claredat mental.'
        }
      }
    }
  }
};