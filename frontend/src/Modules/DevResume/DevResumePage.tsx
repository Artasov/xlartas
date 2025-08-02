'use client';

import { Avatar, Box, Grid, Typography } from '@mui/material';
import {
  SiPython,
  SiTypescript,
  SiC,
  SiCplusplus,
  SiJava,
  SiSass,
  SiHtml5,
  SiCss3,
  SiDjango,
  SiReact,
  SiVuedotjs,
  SiRedux,
  SiMui,
  SiFastapi,
  SiFlask,
  SiQt,
  SiSpring,
  SiElectron,
  SiBootstrap,
  SiGradle,
  SiRabbitmq,
  SiDocker,
  SiNginx,
  SiSelenium,
  SiGit,
  SiLinux,
  SiGnubash,
  SiCmake,
  SiOpencv,
  SiPytorch,
  SiJquery,
  SiRedis,
  SiSqlite,
  SiPostgresql,
  SiMysql,
  SiPycharm,
  SiIntellijidea,
  SiVisualstudiocode,
  SiVisualstudio,
  SiNeovim,
  SiPostman,
  SiFigma,
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiAdobeaudition,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiObsidian,
  SiSublimetext,
} from 'react-icons/si';

const skills = [
  { name: 'Python', Icon: SiPython },
  { name: 'TypeScript', Icon: SiTypescript },
  { name: 'C', Icon: SiC },
  { name: 'C++', Icon: SiCplusplus },
  { name: 'Java', Icon: SiJava },
  { name: 'Sass', Icon: SiSass },
  { name: 'HTML5', Icon: SiHtml5 },
  { name: 'CSS3', Icon: SiCss3 },
  { name: 'Django', Icon: SiDjango },
  { name: 'React', Icon: SiReact },
  { name: 'Vue', Icon: SiVuedotjs },
  { name: 'Redux', Icon: SiRedux },
  { name: 'Material UI', Icon: SiMui },
  { name: 'FastAPI', Icon: SiFastapi },
  { name: 'Flask', Icon: SiFlask },
  { name: 'Qt', Icon: SiQt },
  { name: 'Spring', Icon: SiSpring },
  { name: 'Electron', Icon: SiElectron },
  { name: 'Bootstrap', Icon: SiBootstrap },
  { name: 'Gradle', Icon: SiGradle },
  { name: 'RabbitMQ', Icon: SiRabbitmq },
  { name: 'Docker', Icon: SiDocker },
  { name: 'Nginx', Icon: SiNginx },
  { name: 'Selenium', Icon: SiSelenium },
  { name: 'Git', Icon: SiGit },
  { name: 'Linux', Icon: SiLinux },
  { name: 'Bash', Icon: SiGnubash },
  { name: 'CMake', Icon: SiCmake },
  { name: 'OpenCV', Icon: SiOpencv },
  { name: 'PyTorch', Icon: SiPytorch },
  { name: 'jQuery', Icon: SiJquery },
  { name: 'Redis', Icon: SiRedis },
  { name: 'SQLite', Icon: SiSqlite },
  { name: 'PostgreSQL', Icon: SiPostgresql },
  { name: 'MySQL', Icon: SiMysql },
  { name: 'PyCharm', Icon: SiPycharm },
  { name: 'Intellij IDEA', Icon: SiIntellijidea },
  { name: 'VS Code', Icon: SiVisualstudiocode },
  { name: 'Visual Studio', Icon: SiVisualstudio },
  { name: 'Neovim', Icon: SiNeovim },
  { name: 'Postman', Icon: SiPostman },
  { name: 'Figma', Icon: SiFigma },
  { name: 'After Effects', Icon: SiAdobeaftereffects },
  { name: 'Premiere Pro', Icon: SiAdobepremierepro },
  { name: 'Audition', Icon: SiAdobeaudition },
  { name: 'Photoshop', Icon: SiAdobephotoshop },
  { name: 'Illustrator', Icon: SiAdobeillustrator },
  { name: 'Obsidian', Icon: SiObsidian },
  { name: 'Sublime Text', Icon: SiSublimetext },
];

const experiences = [
  {
    role: 'Software Engineer',
    company: 'Company A',
    period: '2020 – Present',
    description: 'Placeholder experience. Replace with actual details from LinkedIn.',
  },
];

export default function DevResumePage() {
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar
          src="https://via.placeholder.com/150"
          alt="Avatar"
          sx={{ width: 80, height: 80 }}
        />
        <Box>
          <Typography variant="h4">Your Name</Typography>
          <Typography variant="subtitle1">Full Stack Developer</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          About Me
        </Typography>
        <Typography>
          This is a placeholder about me section. Replace this text with a brief description about yourself.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Experience
        </Typography>
        {experiences.map((exp, idx) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              <strong>{exp.role}</strong> – {exp.company}
            </Typography>
            <Typography variant="caption" display="block">
              {exp.period}
            </Typography>
            <Typography>{exp.description}</Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <Typography variant="h5" gutterBottom>
          Technologies
        </Typography>
        <Grid container spacing={2}>
          {skills.map(({ name, Icon }) => (
            <Grid
              item
              xs={4}
              sm={2}
              key={name}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Icon size={32} />
              <Typography variant="caption" align="center">
                {name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

