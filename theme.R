library(ggplot2)

jtheme <- theme_bw() + theme(plot.title = element_text(color = "blue")) 
theme_set(jtheme)

ggplot(data = mtcars, aes(disp, mpg)) + 
  geom_point() + 
  facet_grid( . ~ gear)
