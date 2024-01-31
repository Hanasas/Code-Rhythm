import joblib
import numpy as np
import sys

language_list=[
    "python", "java", "javascript", "c", "c++",
    "c#", "ruby", "swift", "kotlin", "go",
    "php", "rust", "typescript", "sql", "objective-c",
    "shell", "perl", "haskell", "scala", "r"
]

model_filename = 'model.joblib'
loaded_model = joblib.load(model_filename)

def index_language(language):
    for item in range(len(language_list)):
        if language==language_list[item]:
            return item+1

def predict_category(model, language, speed):
    # 预测
    i_language=index_language(language)
    input_array = np.array([[i_language, speed]])
    predicted_category = model.predict(input_array)
    return predicted_category[0] #返回预测值

##################################################################
##                                                              
##  predict_category为预测函数
##  仅支持对language_list中的语言进行预测                               
##  language类型为str，speed类型为float，model原始为loaded_model
##  输出为歌曲类型 
##
##################################################################

##  测试样例，结果为2
# print(predict_category(loaded_model,'go',10.23))

if __name__ == "__main__":
    argv_language = sys.argv[1]
    argv_speed = sys.argv[2]
    print(predict_category(loaded_model,argv_language,argv_speed))