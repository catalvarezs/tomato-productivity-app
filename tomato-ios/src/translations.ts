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
    nav: { timer: 'Timer', tasks: 'Tasks', methods: 'Methods', breathing: 'Breathe' },
    timer: {
      modes: {
        [TimerMode.FOCUS]: 'Focus',
        [TimerMode.SHORT_BREAK]: 'Short Break',
        [TimerMode.LONG_BREAK]: 'Long Break',
      },
      controls: { reset: 'Reset', play: 'Start', pause: 'Pause', sound: 'Ambience', zen: 'Zen Mode' },
      edit: { placeholder: '25', label: 'Set Minutes' },
      technique: { label: 'Technique', custom: 'Custom' }
    },
    tasks: {
      title: 'Tasks',
      subtitle: 'Harvest your goals.',
      inputPlaceholder: 'What needs to be done?',
      inProgress: 'In Progress',
      completed: 'Ripe & Ready',
      emptyPending: { title: 'No pending tasks.', subtitle: 'Enjoy the quiet or add a new goal.' }
    },
    methods: {
      title: 'Techniques',
      subtitle: 'Discover the science behind the rhythms.',
      whyTitle: 'Why use a timer?',
      whyDesc: "Parkinson's Law states that work expands to fill the time available. By setting strict time boundaries, you force your brain to focus and boost productivity.",
      bestFor: 'Best for:',
      cards: {
        pomodoro: { title: 'Pomodoro Technique', desc: 'The classic time management method by Francesco Cirillo. Break work into intervals separated by short breaks.', bestFor: 'Procrastination, starting new tasks, and maintaining high intensity.' },
        fiftyTwo: { title: '52/17 Flow', desc: 'Derived from DeskTime research. The habit of the top 10% most productive employees, treating energy like a battery.', bestFor: 'Deep work sessions, cognitive tasks, and long-term energy.' },
        ultradian: { title: 'Ultradian Rhythm', desc: "Based on the body's natural biological cycles. Our brains can only maintain intense focus for about 90 minutes.", bestFor: 'Complex problem solving, coding, writing, and creative work.' }
      }
    },
    breathing: {
      title: 'Breathing',
      subtitle: 'Calm your mind, restore your focus.',
      instructions: { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale', start: 'Tap to start' },
      cards: {
        box: { title: 'Box Breathing', desc: 'Used by Navy SEALs to stay calm under pressure. Equal duration for all phases.', benefit: 'Instant stress reduction and focus.' },
        relax: { title: '4-7-8 Relax', desc: 'Developed by Dr. Andrew Weil. A natural tranquilizer for the nervous system.', benefit: 'Sleep aid and deep anxiety relief.' },
        coherence: { title: 'Heart Coherence', desc: 'Balances your heart rate variability by breathing at 6 breaths per minute.', benefit: 'Emotional balance and mental clarity.' }
      }
    }
  },
  es: {
    nav: { timer: 'Timer', tasks: 'Tareas', methods: 'Métodos', breathing: 'Respirar' },
    timer: {
      modes: { [TimerMode.FOCUS]: 'Enfoque', [TimerMode.SHORT_BREAK]: 'Descanso Corto', [TimerMode.LONG_BREAK]: 'Descanso Largo' },
      controls: { reset: 'Reiniciar', play: 'Iniciar', pause: 'Pausar', sound: 'Ambiente', zen: 'Modo Zen' },
      edit: { placeholder: '25', label: 'Minutos' },
      technique: { label: 'Técnica', custom: 'Personalizado' }
    },
    tasks: {
      title: 'Tareas', subtitle: 'Cosecha tus objetivos.', inputPlaceholder: '¿Qué hay que hacer?',
      inProgress: 'En Progreso', completed: 'Listas y Maduras',
      emptyPending: { title: 'Sin tareas pendientes.', subtitle: 'Disfruta la calma o añade una meta.' }
    },
    methods: {
      title: 'Técnicas', subtitle: 'Descubre la ciencia detrás de los ritmos.',
      whyTitle: '¿Por qué usar un temporizador?',
      whyDesc: 'La Ley de Parkinson dice que el trabajo se expande hasta llenar el tiempo disponible. Al poner límites, fuerzas a tu cerebro a enfocarse.',
      bestFor: 'Ideal para:',
      cards: {
        pomodoro: { title: 'Técnica Pomodoro', desc: 'El método clásico de Francesco Cirillo. Divide el trabajo en intervalos separados por descansos cortos.', bestFor: 'Procrastinación, iniciar nuevas tareas y mantener intensidad.' },
        fiftyTwo: { title: 'Flujo 52/17', desc: 'Según DeskTime, es el hábito del 10% de empleados más productivos. Trata la energía como una batería.', bestFor: 'Trabajo profundo, tareas cognitivas y maximizar energía.' },
        ultradian: { title: 'Ritmo Ultradiano', desc: 'Basado en ciclos biológicos naturales. El cerebro solo mantiene foco intenso por 90 minutos.', bestFor: 'Resolución de problemas complejos, programación y trabajo creativo.' }
      }
    },
    breathing: {
      title: 'Respiración', subtitle: 'Calma tu mente, restaura tu enfoque.',
      instructions: { inhale: 'Inhala', hold: 'Sostén', exhale: 'Exhala', start: 'Toca para iniciar' },
      cards: {
        box: { title: 'Respiración Cuadrada', desc: 'Usada por los Navy SEALs. Duración igual en todas las fases.', benefit: 'Reducción instantánea de estrés y foco.' },
        relax: { title: '4-7-8 Relax', desc: 'Desarrollada por el Dr. Andrew Weil. Un tranquilizante natural para el sistema nervioso.', benefit: 'Ayuda para dormir y alivio de ansiedad.' },
        coherence: { title: 'Coherencia Cardíaca', desc: 'Equilibra tu variabilidad de frecuencia cardíaca respirando a 6 respiraciones por minuto.', benefit: 'Balance emocional y claridad mental.' }
      }
    }
  },
  pt: {
    nav: { timer: 'Timer', tasks: 'Tarefas', methods: 'Métodos', breathing: 'Respirar' },
    timer: {
      modes: { [TimerMode.FOCUS]: 'Foco', [TimerMode.SHORT_BREAK]: 'Pausa Curta', [TimerMode.LONG_BREAK]: 'Pausa Longa' },
      controls: { reset: 'Reiniciar', play: 'Iniciar', pause: 'Pausar', sound: 'Ambiente', zen: 'Modo Zen' },
      edit: { placeholder: '25', label: 'Minutos' },
      technique: { label: 'Técnica', custom: 'Personalizado' }
    },
    tasks: {
      title: 'Tarefas', subtitle: 'Colha seus objetivos.', inputPlaceholder: 'O que precisa ser feito?',
      inProgress: 'Em Andamento', completed: 'Maduras & Prontas',
      emptyPending: { title: 'Sem tarefas pendentes.', subtitle: 'Aproveite a calma ou adicione uma meta.' }
    },
    methods: {
      title: 'Técnicas', subtitle: 'Descubra a ciência por trás dos ritmos.',
      whyTitle: 'Por que usar um temporizador?',
      whyDesc: 'A Lei de Parkinson afirma que o trabalho se expande para preencher o tempo disponível. Defina limites e force seu cérebro a focar.',
      bestFor: 'Melhor para:',
      cards: {
        pomodoro: { title: 'Técnica Pomodoro', desc: 'O método clássico de Francesco Cirillo. Divide o trabalho em intervalos com pausas curtas.', bestFor: 'Procrastinação, iniciar tarefas e manter intensidade.' },
        fiftyTwo: { title: 'Fluxo 52/17', desc: 'Baseado em estudo da DeskTime. O hábito dos 10% mais produtivos.', bestFor: 'Trabalho profundo, tarefas cognitivas e energia.' },
        ultradian: { title: 'Ritmo Ultradiano', desc: 'Baseado em ciclos biológicos. O cérebro mantém foco por cerca de 90 minutos.', bestFor: 'Resolução de problemas, programação e trabalho criativo.' }
      }
    },
    breathing: {
      title: 'Respiração', subtitle: 'Acalme sua mente, restaure seu foco.',
      instructions: { inhale: 'Inspire', hold: 'Segure', exhale: 'Expire', start: 'Toque para iniciar' },
      cards: {
        box: { title: 'Respiração Quadrada', desc: 'Usada pelos Navy SEALs. Duração igual para todas as fases.', benefit: 'Redução instantânea de estresse e foco.' },
        relax: { title: '4-7-8 Relax', desc: 'Desenvolvida pelo Dr. Andrew Weil. Um tranquilizante natural.', benefit: 'Ajuda para dormir e alívio de ansiedade.' },
        coherence: { title: 'Coerência Cardíaca', desc: 'Equilibra sua variabilidade da frequência cardíaca a 6 respirações por minuto.', benefit: 'Equilíbrio emocional e clareza mental.' }
      }
    }
  },
  de: {
    nav: { timer: 'Timer', tasks: 'Aufgaben', methods: 'Methoden', breathing: 'Atmung' },
    timer: {
      modes: { [TimerMode.FOCUS]: 'Fokus', [TimerMode.SHORT_BREAK]: 'Kurze Pause', [TimerMode.LONG_BREAK]: 'Lange Pause' },
      controls: { reset: 'Zurücksetzen', play: 'Start', pause: 'Pause', sound: 'Ambiente', zen: 'Zen-Modus' },
      edit: { placeholder: '25', label: 'Minuten' },
      technique: { label: 'Technik', custom: 'Benutzerdefiniert' }
    },
    tasks: {
      title: 'Aufgaben', subtitle: 'Ernten Sie Ihre Ziele.', inputPlaceholder: 'Was muss erledigt werden?',
      inProgress: 'In Bearbeitung', completed: 'Fertig & Reif',
      emptyPending: { title: 'Keine ausstehenden Aufgaben.', subtitle: 'Genießen Sie die Ruhe oder fügen Sie ein Ziel hinzu.' }
    },
    methods: {
      title: 'Techniken', subtitle: 'Entdecken Sie die Wissenschaft der Rhythmen.',
      whyTitle: 'Warum einen Timer verwenden?',
      whyDesc: 'Das Parkinsonsche Gesetz: Arbeit dehnt sich aus, um die verfügbare Zeit zu füllen. Strenge Zeitlimits zwingen das Gehirn zum Fokus.',
      bestFor: 'Ideal für:',
      cards: {
        pomodoro: { title: 'Pomodoro-Technik', desc: 'Die klassische Methode von Francesco Cirillo. Arbeit in Intervalle mit kurzen Pausen unterteilt.', bestFor: 'Prokrastination, neue Aufgaben und hohe Intensität.' },
        fiftyTwo: { title: '52/17 Flow', desc: 'Laut DeskTime die Gewohnheit der produktivsten 10%. Energie wie eine Batterie.', bestFor: 'Tiefes Arbeiten, kognitive Aufgaben und Energie.' },
        ultradian: { title: 'Ultradianer Rhythmus', desc: 'Basiert auf biologischen Zyklen. Das Gehirn hält intensiven Fokus nur 90 Minuten.', bestFor: 'Problemlösung, Programmieren und kreative Arbeit.' }
      }
    },
    breathing: {
      title: 'Atmung', subtitle: 'Beruhigen Sie Ihren Geist, stellen Sie Ihren Fokus wieder her.',
      instructions: { inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen', start: 'Tippen zum Starten' },
      cards: {
        box: { title: 'Box-Atmung', desc: 'Von Navy SEALs verwendet. Gleiche Dauer für alle Phasen.', benefit: 'Sofortige Stressreduzierung und Fokus.' },
        relax: { title: '4-7-8 Entspannung', desc: 'Von Dr. Andrew Weil. Ein natürliches Beruhigungsmittel.', benefit: 'Einschlafhilfe und Angstlinderung.' },
        coherence: { title: 'Herzkoherenz', desc: 'Atmen mit 6 Atemzügen pro Minute für HRV-Balance.', benefit: 'Emotionales Gleichgewicht und Klarheit.' }
      }
    }
  },
  ca: {
    nav: { timer: 'Timer', tasks: 'Tasques', methods: 'Mètodes', breathing: 'Respirar' },
    timer: {
      modes: { [TimerMode.FOCUS]: 'Focus', [TimerMode.SHORT_BREAK]: 'Descans Curt', [TimerMode.LONG_BREAK]: 'Descans Llarg' },
      controls: { reset: 'Reiniciar', play: 'Iniciar', pause: 'Pausar', sound: 'Ambient', zen: 'Mode Zen' },
      edit: { placeholder: '25', label: 'Minuts' },
      technique: { label: 'Tècnica', custom: 'Personalitzat' }
    },
    tasks: {
      title: 'Tasques', subtitle: 'Cull els teus objectius.', inputPlaceholder: 'Què cal fer?',
      inProgress: 'En Progrés', completed: 'Llestes i Madures',
      emptyPending: { title: 'Sense tasques pendents.', subtitle: 'Gaudeix de la calma o afegeix una fita.' }
    },
    methods: {
      title: 'Tècniques', subtitle: 'Descobreix la ciència darrere els ritmes.',
      whyTitle: 'Per què utilitzar un temporitzador?',
      whyDesc: "La Llei de Parkinson diu que la feina s'expandeix fins a omplir el temps disponible. En posar límits, forces el cervell a enfocar-se.",
      bestFor: 'Ideal per a:',
      cards: {
        pomodoro: { title: 'Tècnica Pomodoro', desc: "El mètode clàssic de Francesco Cirillo. Divideix la feina en intervals amb descansos curts.", bestFor: "Procrastinació, començar noves tasques i mantenir intensitat." },
        fiftyTwo: { title: 'Flux 52/17', desc: "Segons DeskTime, és l'hàbit del 10% més productius. Energia com una bateria.", bestFor: "Treball profund, tasques cognitives i energia." },
        ultradian: { title: 'Ritme Ultradià', desc: "Basat en cicles biològics naturals. El cervell manté focus intens durant 90 minuts.", bestFor: "Resolució de problemes, programació i treball creatiu." }
      }
    },
    breathing: {
      title: 'Respiració', subtitle: 'Calma la teva ment, restaura el teu focus.',
      instructions: { inhale: 'Inhala', hold: 'Aguanta', exhale: 'Exhala', start: 'Toca per iniciar' },
      cards: {
        box: { title: 'Respiració Quadrada', desc: "Usada pels Navy SEALs. Durada igual en totes les fases.", benefit: "Reducció instantània d'estrès i focus." },
        relax: { title: '4-7-8 Relax', desc: "Desenvolupada pel Dr. Andrew Weil. Un tranquil·litzant natural.", benefit: "Ajuda per dormir i alleujament d'ansietat." },
        coherence: { title: 'Coherència Cardíaca', desc: "Equilibra la teva VFC respirant a 6 respiracions per minut.", benefit: "Balanç emocional i claredat mental." }
      }
    }
  }
};
