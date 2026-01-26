SUMMARY
================================================================================

The personality-data.csv file contains the data about the personalities and the
movie preferences of 1834 users.
The ratings.csv file contains the ratings of users in the personality-data.csv
file contributed.

USAGE LICENSE
================================================================================

Neither the University of Minnesota nor any of the researchers
involved can guarantee the correctness of the data, its suitability
for any particular purpose, or the validity of results based on the
use of the data set.  The data set may be used for any research
purposes under the following conditions:

     * The user may not state or imply any endorsement from the
       University of Minnesota or the GroupLens Research Group.

     * The user must acknowledge the use of the data set in
       publications resulting from the use of the data set
       (see below for citation information).

     * The user may not redistribute the data without separate
       permission.

     * The user may not use this information for any commercial or
       revenue-bearing purposes without first obtaining permission
       from a faculty member of the GroupLens Research Project at the
       University of Minnesota.

If you have any further questions or comments, please contact GroupLens
<grouplens-info@umn.edu>.

CITATION
================================================================================

To acknowledge use of the dataset in publications, please cite the following
paper:

Nguyen, T.T., Maxwell Harper, F., Terveen, L. et al. Inf Syst Front (2018) 20: 1173.
https://doi.org/10.1007/s10796-017-9782-y

ACKNOWLEDGEMENTS
================================================================================

Thank you Max and Raghav for the help in preparing the dataset to publish for research purposes.


FURTHER INFORMATION ABOUT THE GROUPLENS RESEARCH PROJECT
================================================================================

The GroupLens Research Project is a research group in the Department of
Computer Science and Engineering at the University of Minnesota. Members of
the GroupLens Research Project are involved in many research projects related
to the fields of information filtering, collaborative filtering, and
recommender systems. The project is lead by professors John Riedl and Joseph
Konstan. The project began to explore automated collaborative filtering in
1992, but is most well known for its world wide trial of an automated
collaborative filtering system for Usenet news in 1996. Since then the project
has expanded its scope to research overall information filtering solutions,
integrating in content-based methods as well as improving current collaborative
filtering technology.

Further information on the GroupLens Research project, including research
publications, can be found at the following web site:

        https://grouplens.org/

GroupLens Research currently operates a movie recommender based on
collaborative filtering:

        https://movielens.org/

FILE DESCRIPTION
================================================================================

The personality-data contains the header which described as follows:


Userid: the hashed user_id.

Openness: an assessment score (from 1 to 7) assessing user tendency to prefer new experience. 1 means the user has tendency NOT to prefer new experience, 7 means the user has tendency to prefer new experience.

Agreeableness: an assessment score (from 1 to 7) assessing user tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others. 1 means the user has tendency to NOT be compassionate and cooperative. 7 means the user has tendency to be compassionate and cooperative.

Emotional Stability: an assessment score (from 1 to 7) assessing user tendency to have psychological stress. 1 means the user has tendency to have psychological stress, and 7 means the user has tendency to NOT have psychological stress.

Conscientiousness: an assessment score (from 1 to 7) assessing user tendency to be organized and dependable, and show self-discipline. 1 means the user does not have such a tendency, and 7 means the user has such tendency.

Extraversion: an assessment score (from 1 to 7) assessing user tendency to be outgoing. 1 means the user does not have such a tendency, and 7 means the user has such a tendency.

Assigned Metric: one of the follows (serendipity, popularity, diversity, default). Each user, besides being assessed their personality, was evaluated their preferences for a list of 12 movies manipulated with serendipity, popularity, diversity value or none (default option).

Assigned Condition: one of the follows (high, medium, low). Based on the assigned metric, and this assigned condition, the list of movies was generated for the users. For example: if the assigned metric is serendipity and the assigned condition is high, the movies in the list are highly serendipitous. We document how we manipulated the movie list based on the assigned condition and assigned metric in page 6 of our research paper mentioned above.

Movie_x (x is from 1 to 12): The list consists of 12 movies. These fields contain the ids of the twelve movies in the list.

Predicted_rating_x (x is from 1 to 12): the predicted rating of the corresponding movie_x for the user.

Is_Personalized:  The response of the user to the question `This list is personalized for me`. Users answered on the 5-point Likert scale. (1: Strongly Disagree, 5: Strongly Agree).

Enjoy_watching: The response of the user to the question `This list contains movies I think I enjoyed watching`. Users answered on the 5-point Likert scale. (1: Strongly Disagree, 5: Strongly Agree)

For more information about the data, and how we collected and ran the study, please refer to page 5 in our research paper.

The ratings.csv file contains the header as described as follows:

userId: the hashed user_id.
movieId: the id of the movie that the user (corresponding to userId) rated.
rating: the rating (from 0.5 to 5 stars) provided by the user.
tstamp: when the user rated the movie.
