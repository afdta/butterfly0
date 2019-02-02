library(tidyverse)
library(jsonlite)

load("/home/alec/Projects/Brookings/black-cities/build/data/ButterflyData03.RDA")

json <- toJSON(ts.plot, na="null", digits=5, pretty=TRUE)

writeLines(c("var all_data = ", json, ";", "export default all_data", ";"), "/home/alec/Projects/Brookings/black-cities/build/js/data.js")




