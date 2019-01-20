require(dplyr)
library(rmarkdown)
library(tidyverse)
library(tidyverse)
library(here)
library(ggrepel)
library(viridis)

enr <- read_csv(here("data", "enr.csv"))
enr_lim <- sample_frac(enr, size = 0.03, replace=FALSE)
ggplot(data=enr_lim)

ggplot(enr_lim, aes(x=read_score))

ggplot(enr_lim, aes(x=read_score, y=math_score)) + 
  geom_point()

ggplot(enr_lim, aes(x=read_score, y=math_score, color=ell)) + 
  geom_point() 

ggplot(enr_lim, aes(x=read_score, y=math_score, color=ell)) + 
  geom_point() + 
  geom_smooth()

# aes is only related to data-based aesthetics

# opacity
ggplot(enr_lim, aes(x=read_score, y=math_score, color=ell)) + 
  geom_point(alpha = 0.3, size=0.5) 

# var-driven opacity
ggplot(enr_lim, aes(x=read_score, y=math_score, alpha=ell)) + 
  geom_point() 

# area-size related to counts automatically!
enr %>% 
  filter(grade %in% c("3", "4", "5","6", "7", "8","10")) %>%
  group_by(grade) %>%
  summarize(count = n(),
            avg_read = mean(read_score),
            read_sd = sd(read_score),
            percent_atrisk = sum(atrisk)/n()) %>%
  ggplot(aes(x=avg_read, y=read_sd, size=count, alpha=percent_atrisk)) +
  geom_point()


# labelling near the geometric point
enr %>% 
  filter(grade %in% c("3", "4", "5","6", "7", "8","10")) %>%
  group_by(grade) %>%
  summarize(count = n(),
            avg_read = mean(read_score),
            read_sd = sd(read_score),
            percent_atrisk = sum(atrisk)/n()) %>%
  ggplot(aes(x=avg_read, y=read_sd)) +
  geom_point(aes(size=count, alpha=percent_atrisk)) + 
  geom_label(aes(label=grade), nudge_x=0.01)

# overlapping labels fixed with ggrepel:
enr %>% 
  filter(grade %in% c("3", "4", "5","6", "7", "8","10")) %>%
  group_by(grade) %>%
  summarize(count = n(),
            avg_read = mean(read_score),
            read_sd = sd(read_score),
            percent_atrisk = sum(atrisk)/n()) %>%
  ggplot(aes(x=avg_read, y=read_sd)) +
  geom_point(aes(size=count, alpha=percent_atrisk)) + 
  geom_label_repel(aes(label=grade))


data(Puromycin)
Puromycin$time <- as.factor(c(1:12,1:11))

ggplot(Puromycin, aes(x=state, y=time, fill=rate)) + 
  geom_tile() + 
  scale_fill_viridis(option="magma")
