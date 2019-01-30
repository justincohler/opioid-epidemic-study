library(ggplot2)
library(extrafont)

fonts()

bg_color <- "#7A777A"
text_color <- "#EEEEEE"
grid_color <- "#BBBBBB"

jtheme <- theme_bw() + theme(
  text = element_text(family="Quick", color = text_color),
  
  # Plot 
  plot.background = element_rect(fill=bg_color),
  #  plot.title = element_text(family="Brandon Grotesque Black"),
  #  plot.subtitle = element_text(family="Brandon Grotesque Light"),
  #  plot.caption = element_text(family="Brandon Grotesque Thin"),
  
  # Legend
  legend.text = element_text("Consolas"),
  #  legend.title = element_text("Brandon Grotesque Black"),
  legend.background = element_rect(fill=bg_color),
  legend.key = element_rect(fill=bg_color),
  
  
  # Axes
  axis.line =  element_line(colour=grid_color),
  axis.text = element_text(family="Consolas", colour=text_color),
  axis.text.x.bottom = element_text(margin=margin(10, 10, 10, 10)),
  axis.text.y.left = element_text(margin=margin(10, 10, 10, 10)),
  
  axis.title = element_text(family="Quick"),
  axis.line.x.bottom = element_blank(),
  axis.line.y.left = element_blank(),
  axis.ticks.x = element_line(colour=grid_color),
  axis.ticks.y = element_line(colour=grid_color),
  
  # Panels
  panel.background = element_rect(fill=bg_color),
  panel.border = element_blank(),
  #  panel.grid = element_blank(),
  panel.grid.major.x = element_line(colour=grid_color),
  panel.grid.major.y = element_line(colour=grid_color),
  panel.grid.minor.x = element_blank(),
  panel.grid.minor.y = element_blank()
)
